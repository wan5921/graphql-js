import { describe, it, beforeEach } from 'node:test';
import { expect } from 'chai';

import { graphql } from '../graphql.ts';
import { userPostSchema, resetData } from './userPostSchema.ts';

describe('userPostSchema', () => {
  beforeEach(() => {
    resetData();
  });

  it('can create a user', async () => {
    const query = `
      mutation {
        addUser(name: "Alice") {
          id
          name
        }
      }
    `;
    const result = await graphql({ schema: userPostSchema, source: query });
    expect(result).to.deep.equal({
      data: {
        addUser: {
          id: '1',
          name: 'Alice',
        },
      },
    });
  });

  it('can create a post for a user', async () => {
    const addUserQuery = `
      mutation {
        addUser(name: "Alice") {
          id
        }
      }
    `;
    await graphql({ schema: userPostSchema, source: addUserQuery });

    const addPostQuery = `
      mutation {
        addPost(title: "Hello World", authorId: "1") {
          id
          title
          authorId
          author {
            id
            name
          }
        }
      }
    `;
    const result = await graphql({ schema: userPostSchema, source: addPostQuery });
    expect(result).to.deep.equal({
      data: {
        addPost: {
          id: '1',
          title: 'Hello World',
          authorId: '1',
          author: {
            id: '1',
            name: 'Alice',
          },
        },
      },
    });
  });

  it('returns error when creating a post for non-existent user', async () => {
    const addPostQuery = `
      mutation {
        addPost(title: "Hello World", authorId: "999") {
          id
        }
      }
    `;
    const result = await graphql({ schema: userPostSchema, source: addPostQuery });
    expect(result.errors).to.exist;
    expect(result.errors![0].message).to.equal('User with id 999 does not exist');
  });

  it('can query user by id and their posts', async () => {
    await graphql({
      schema: userPostSchema,
      source: `mutation { addUser(name: "Alice") { id } }`,
    });
    await graphql({
      schema: userPostSchema,
      source: `mutation { addPost(title: "First Post", authorId: "1") { id } }`,
    });
    await graphql({
      schema: userPostSchema,
      source: `mutation { addPost(title: "Second Post", authorId: "1") { id } }`,
    });

    const query = `
      query {
        user(id: "1") {
          id
          name
          posts {
            id
            title
          }
        }
      }
    `;
    const result = await graphql({ schema: userPostSchema, source: query });
    expect(result).to.deep.equal({
      data: {
        user: {
          id: '1',
          name: 'Alice',
          posts: [
            { id: '1', title: 'First Post' },
            { id: '2', title: 'Second Post' },
          ],
        },
      },
    });
  });

  it('can query all posts', async () => {
    await graphql({
      schema: userPostSchema,
      source: `mutation { addUser(name: "Alice") { id } }`,
    });
    await graphql({
      schema: userPostSchema,
      source: `mutation { addUser(name: "Bob") { id } }`,
    });
    await graphql({
      schema: userPostSchema,
      source: `mutation { addPost(title: "Alice Post", authorId: "1") { id } }`,
    });
    await graphql({
      schema: userPostSchema,
      source: `mutation { addPost(title: "Bob Post", authorId: "2") { id } }`,
    });

    const query = `
      query {
        posts {
          id
          title
          author {
            name
          }
        }
      }
    `;
    const result = await graphql({ schema: userPostSchema, source: query });
    expect(result).to.deep.equal({
      data: {
        posts: [
          {
            id: '1',
            title: 'Alice Post',
            author: { name: 'Alice' },
          },
          {
            id: '2',
            title: 'Bob Post',
            author: { name: 'Bob' },
          },
        ],
      },
    });
  });

  it('can update a user', async () => {
    await graphql({
      schema: userPostSchema,
      source: `mutation { addUser(name: "Alice") { id } }`,
    });

    const updateQuery = `
      mutation {
        updateUser(id: "1", name: "Alice Wonderland") {
          id
          name
        }
      }
    `;
    const result = await graphql({ schema: userPostSchema, source: updateQuery });
    expect(result).to.deep.equal({
      data: {
        updateUser: {
          id: '1',
          name: 'Alice Wonderland',
        },
      },
    });
  });

  it('returns error when updating non-existent user', async () => {
    const updateQuery = `
      mutation {
        updateUser(id: "999", name: "Ghost") {
          id
        }
      }
    `;
    const result = await graphql({ schema: userPostSchema, source: updateQuery });
    expect(result.errors).to.exist;
    expect(result.errors![0].message).to.equal('User with id 999 does not exist');
  });

  it('can delete a user and cascade delete posts', async () => {
    await graphql({
      schema: userPostSchema,
      source: `mutation { addUser(name: "Alice") { id } }`,
    });
    await graphql({
      schema: userPostSchema,
      source: `mutation { addPost(title: "Alice Post", authorId: "1") { id } }`,
    });

    const deleteQuery = `
      mutation {
        deleteUser(id: "1") {
          id
          name
        }
      }
    `;
    const deleteResult = await graphql({ schema: userPostSchema, source: deleteQuery });
    expect(deleteResult).to.deep.equal({
      data: {
        deleteUser: {
          id: '1',
          name: 'Alice',
        },
      },
    });

    // Check user is gone
    const userResult = await graphql({
      schema: userPostSchema,
      source: `query { user(id: "1") { id } }`,
    });
    expect(userResult).to.deep.equal({
      data: {
        user: null,
      },
    });

    // Check post is gone
    const postsResult = await graphql({
      schema: userPostSchema,
      source: `query { posts { id } }`,
    });
    expect(postsResult).to.deep.equal({
      data: {
        posts: [],
      },
    });
  });

  it('can update a post', async () => {
    await graphql({
      schema: userPostSchema,
      source: `mutation { addUser(name: "Alice") { id } }`,
    });
    await graphql({
      schema: userPostSchema,
      source: `mutation { addPost(title: "Old Title", authorId: "1") { id } }`,
    });

    const updatePostQuery = `
      mutation {
        updatePost(id: "1", title: "New Title") {
          id
          title
        }
      }
    `;
    const result = await graphql({ schema: userPostSchema, source: updatePostQuery });
    expect(result).to.deep.equal({
      data: {
        updatePost: {
          id: '1',
          title: 'New Title',
        },
      },
    });
  });

  it('returns error when updating non-existent post', async () => {
    const updatePostQuery = `
      mutation {
        updatePost(id: "999", title: "Ghost Post") {
          id
        }
      }
    `;
    const result = await graphql({ schema: userPostSchema, source: updatePostQuery });
    expect(result.errors).to.exist;
    expect(result.errors![0].message).to.equal('Post with id 999 does not exist');
  });

  it('can delete a post', async () => {
    await graphql({
      schema: userPostSchema,
      source: `mutation { addUser(name: "Alice") { id } }`,
    });
    await graphql({
      schema: userPostSchema,
      source: `mutation { addPost(title: "Alice Post", authorId: "1") { id } }`,
    });

    const deletePostQuery = `
      mutation {
        deletePost(id: "1") {
          id
          title
        }
      }
    `;
    const result = await graphql({ schema: userPostSchema, source: deletePostQuery });
    expect(result).to.deep.equal({
      data: {
        deletePost: {
          id: '1',
          title: 'Alice Post',
        },
      },
    });

    // Check post is gone
    const postsResult = await graphql({
      schema: userPostSchema,
      source: `query { posts { id } }`,
    });
    expect(postsResult).to.deep.equal({
      data: {
        posts: [],
      },
    });
  });
});
