import { describe, it } from 'node:test';

import { expect } from 'chai';

import { graphql } from '../graphql.ts';

import { resetUserPostStore, userPostSchema } from './userPostSchema.ts';

describe('UserPostSchema', () => {
  it('uses addUser and user(id) to create, query, update, and delete a user', async () => {
    resetUserPostStore();

    const addUserResult = await graphql({
      schema: userPostSchema,
      source: `
        mutation {
          addUser(
            input: { name: "Linus Torvalds", email: "linus@example.com" }
          ) {
            id
            name
            email
            posts {
              id
            }
          }
        }
      `,
    });

    expect(addUserResult).to.deep.equal({
      data: {
        addUser: {
          id: '3',
          name: 'Linus Torvalds',
          email: 'linus@example.com',
          posts: [],
        },
      },
    });

    const userResult = await graphql({
      schema: userPostSchema,
      source: `
        query {
          user(id: "3") {
            id
            name
            email
            posts {
              id
            }
          }
        }
      `,
    });

    expect(userResult).to.deep.equal({
      data: {
        user: {
          id: '3',
          name: 'Linus Torvalds',
          email: 'linus@example.com',
          posts: [],
        },
      },
    });

    const updateUserResult = await graphql({
      schema: userPostSchema,
      source: `
        mutation {
          updateUser(
            input: { id: "3", name: "Linus", email: "linus@kernel.org" }
          ) {
            id
            name
            email
          }
        }
      `,
    });

    expect(updateUserResult).to.deep.equal({
      data: {
        updateUser: {
          id: '3',
          name: 'Linus',
          email: 'linus@kernel.org',
        },
      },
    });

    const deleteUserResult = await graphql({
      schema: userPostSchema,
      source: `
        mutation {
          deleteUser(id: "3") {
            id
            name
          }
        }
      `,
    });

    expect(deleteUserResult).to.deep.equal({
      data: {
        deleteUser: {
          id: '3',
          name: 'Linus',
        },
      },
    });

    const deletedUserResult = await graphql({
      schema: userPostSchema,
      source: `
        query {
          user(id: "3") {
            id
          }
        }
      `,
    });

    expect(deletedUserResult).to.deep.equal({
      data: {
        user: null,
      },
    });
  });

  it('uses addPost and posts to create, query, update, and delete a post', async () => {
    resetUserPostStore();

    const addPostResult = await graphql({
      schema: userPostSchema,
      source: `
        mutation {
          addPost(
            input: {
              userId: "1"
              title: "Testing GraphQL"
              content: "Use graphql() for end-to-end assertions."
            }
          ) {
            id
            title
            content
            author {
              id
              name
            }
          }
        }
      `,
    });

    expect(addPostResult).to.deep.equal({
      data: {
        addPost: {
          id: '3',
          title: 'Testing GraphQL',
          content: 'Use graphql() for end-to-end assertions.',
          author: {
            id: '1',
            name: 'Ada Lovelace',
          },
        },
      },
    });

    const postsResult = await graphql({
      schema: userPostSchema,
      source: `
        query {
          posts {
            id
            title
            author {
              id
            }
          }
        }
      `,
    });

    expect(postsResult).to.deep.equal({
      data: {
        posts: [
          {
            id: '1',
            title: 'GraphQL Basics',
            author: { id: '1' },
          },
          {
            id: '2',
            title: 'Schema Design',
            author: { id: '2' },
          },
          {
            id: '3',
            title: 'Testing GraphQL',
            author: { id: '1' },
          },
        ],
      },
    });

    const updatePostResult = await graphql({
      schema: userPostSchema,
      source: `
        mutation {
          updatePost(
            input: {
              id: "3"
              title: "Testing GraphQL Thoroughly"
              content: "Mutation and query paths stay consistent."
            }
          ) {
            id
            title
            content
          }
        }
      `,
    });

    expect(updatePostResult).to.deep.equal({
      data: {
        updatePost: {
          id: '3',
          title: 'Testing GraphQL Thoroughly',
          content: 'Mutation and query paths stay consistent.',
        },
      },
    });

    const deletePostResult = await graphql({
      schema: userPostSchema,
      source: `
        mutation {
          deletePost(id: "3") {
            id
            title
          }
        }
      `,
    });

    expect(deletePostResult).to.deep.equal({
      data: {
        deletePost: {
          id: '3',
          title: 'Testing GraphQL Thoroughly',
        },
      },
    });

    const postsAfterDeleteResult = await graphql({
      schema: userPostSchema,
      source: `
        query {
          posts {
            id
          }
        }
      `,
    });

    expect(postsAfterDeleteResult).to.deep.equal({
      data: {
        posts: [{ id: '1' }, { id: '2' }],
      },
    });
  });

  it('returns resolver errors for addPost when the user does not exist', async () => {
    resetUserPostStore();

    const result = await graphql({
      schema: userPostSchema,
      source: `
        mutation {
          addPost(
            input: {
              userId: "999"
              title: "Broken relation"
              content: "This should fail."
            }
          ) {
            id
          }
        }
      `,
    });

    expect(result.data).to.deep.equal(null);
    expect(result.errors).to.have.lengthOf(1);
    expect(result.errors?.[0]?.message).to.equal(
      'User with id "999" does not exist.',
    );
    expect(result.errors?.[0]?.path).to.deep.equal(['addPost']);
  });

  it('returns validation errors for user(id) when required arguments are missing', async () => {
    resetUserPostStore();

    const result = await graphql({
      schema: userPostSchema,
      source: `
        query {
          user {
            id
          }
        }
      `,
    });

    expect(result.data).to.equal(undefined);
    expect(result.errors).to.have.lengthOf(1);
    expect(result.errors?.[0]?.message).to.equal(
      'Field "user" argument "id" of type "ID!" is required, but it was not provided.',
    );
  });
});
