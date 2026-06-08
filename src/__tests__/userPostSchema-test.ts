import { describe, it, beforeEach } from 'node:test';

import { expect } from 'chai';

import { graphql } from '../graphql.ts';

import { UserPostSchema as schema, resetUserPostData } from './userPostSchema.ts';

describe('UserPostSchema', () => {
  beforeEach(() => {
    resetUserPostData();
  });

  describe('Mutation: addUser', () => {
    it('creates a new user with name and returns the user', async () => {
      const source = `
        mutation {
          addUser(name: "Alice") {
            id
            name
            email
          }
        }
      `;

      const result = await graphql({ schema, source });
      expect(result).to.deep.equal({
        data: {
          addUser: {
            id: '1',
            name: 'Alice',
            email: null,
          },
        },
      });
    });

    it('creates a new user with name and email', async () => {
      const source = `
        mutation {
          addUser(name: "Bob", email: "bob@example.com") {
            id
            name
            email
          }
        }
      `;

      const result = await graphql({ schema, source });
      expect(result).to.deep.equal({
        data: {
          addUser: {
            id: '1',
            name: 'Bob',
            email: 'bob@example.com',
          },
        },
      });
    });

    it('assigns incrementing ids to users', async () => {
      const source1 = `
        mutation {
          addUser(name: "Alice") {
            id
            name
          }
        }
      `;

      const source2 = `
        mutation {
          addUser(name: "Bob") {
            id
            name
          }
        }
      `;

      const result1 = await graphql({ schema, source: source1 });
      expect(result1.data?.addUser).to.deep.equal({ id: '1', name: 'Alice' });

      const result2 = await graphql({ schema, source: source2 });
      expect(result2.data?.addUser).to.deep.equal({ id: '2', name: 'Bob' });
    });

    it('returns an error when name is missing', async () => {
      const source = `
        mutation {
          addUser {
            id
            name
          }
        }
      `;

      const result = await graphql({ schema, source });
      expect(result.errors).to.not.be.undefined;
      expect(result.errors?.[0]?.message).to.include(
        'Field "addUser" argument "name" of type "String!" is required',
      );
    });
  });

  describe('Mutation: addPost', () => {
    it('creates a new post for an existing user', async () => {
      const addUserSource = `
        mutation {
          addUser(name: "Alice") {
            id
          }
        }
      `;

      await graphql({ schema, source: addUserSource });

      const addPostSource = `
        mutation {
          addPost(title: "Hello World", content: "My first post", authorId: "1") {
            id
            title
            content
            author {
              id
              name
            }
          }
        }
      `;

      const result = await graphql({ schema, source: addPostSource });
      expect(result).to.deep.equal({
        data: {
          addPost: {
            id: '1',
            title: 'Hello World',
            content: 'My first post',
            author: {
              id: '1',
              name: 'Alice',
            },
          },
        },
      });
    });

    it('returns null when authorId does not exist', async () => {
      const source = `
        mutation {
          addPost(title: "Orphan Post", authorId: "999") {
            id
            title
          }
        }
      `;

      const result = await graphql({ schema, source });
      expect(result).to.deep.equal({
        data: {
          addPost: null,
        },
      });
    });

    it('assigns incrementing ids to posts', async () => {
      const addUserSource = `
        mutation {
          addUser(name: "Alice") {
            id
          }
        }
      `;

      await graphql({ schema, source: addUserSource });

      const addPost1Source = `
        mutation {
          addPost(title: "First Post", authorId: "1") {
            id
            title
          }
        }
      `;

      const addPost2Source = `
        mutation {
          addPost(title: "Second Post", authorId: "1") {
            id
            title
          }
        }
      `;

      const result1 = await graphql({ schema, source: addPost1Source });
      expect(result1.data?.addPost).to.deep.equal({
        id: '1',
        title: 'First Post',
      });

      const result2 = await graphql({ schema, source: addPost2Source });
      expect(result2.data?.addPost).to.deep.equal({
        id: '2',
        title: 'Second Post',
      });
    });

    it('returns an error when required arguments are missing', async () => {
      const source = `
        mutation {
          addPost {
            id
            title
          }
        }
      `;

      const result = await graphql({ schema, source });
      expect(result.errors).to.not.be.undefined;
      expect(result.errors?.[0]?.message).to.include(
        'Field "addPost" argument "title" of type "String!" is required',
      );
    });
  });

  describe('Query: user(id)', () => {
    it('returns a user by id', async () => {
      const addUserSource = `
        mutation {
          addUser(name: "Alice", email: "alice@example.com") {
            id
          }
        }
      `;

      await graphql({ schema, source: addUserSource });

      const source = `
        query {
          user(id: "1") {
            id
            name
            email
          }
        }
      `;

      const result = await graphql({ schema, source });
      expect(result).to.deep.equal({
        data: {
          user: {
            id: '1',
            name: 'Alice',
            email: 'alice@example.com',
          },
        },
      });
    });

    it('returns null when user does not exist', async () => {
      const source = `
        query {
          user(id: "999") {
            id
            name
          }
        }
      `;

      const result = await graphql({ schema, source });
      expect(result).to.deep.equal({
        data: {
          user: null,
        },
      });
    });

    it('returns a user with their posts', async () => {
      const addUserSource = `
        mutation {
          addUser(name: "Alice") {
            id
          }
        }
      `;

      await graphql({ schema, source: addUserSource });

      const addPostSource = `
        mutation {
          p1: addPost(title: "Post 1", authorId: "1") { id title }
          p2: addPost(title: "Post 2", authorId: "1") { id title }
        }
      `;

      await graphql({ schema, source: addPostSource });

      const source = `
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

      const result = await graphql({ schema, source });
      expect(result).to.deep.equal({
        data: {
          user: {
            id: '1',
            name: 'Alice',
            posts: [
              { id: '1', title: 'Post 1' },
              { id: '2', title: 'Post 2' },
            ],
          },
        },
      });
    });

    it('returns a user with an empty posts list when no posts exist', async () => {
      const addUserSource = `
        mutation {
          addUser(name: "Alice") {
            id
          }
        }
      `;

      await graphql({ schema, source: addUserSource });

      const source = `
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

      const result = await graphql({ schema, source });
      expect(result).to.deep.equal({
        data: {
          user: {
            id: '1',
            name: 'Alice',
            posts: [],
          },
        },
      });
    });

    it('uses variable for user id', async () => {
      const addUserSource = `
        mutation {
          addUser(name: "Bob") {
            id
          }
        }
      `;

      await graphql({ schema, source: addUserSource });

      const source = `
        query GetUser($userId: ID!) {
          user(id: $userId) {
            id
            name
          }
        }
      `;

      const result = await graphql({
        schema,
        source,
        variableValues: { userId: '1' },
      });
      expect(result).to.deep.equal({
        data: {
          user: {
            id: '1',
            name: 'Bob',
          },
        },
      });
    });
  });

  describe('Query: posts', () => {
    it('returns all posts with their authors', async () => {
      const setupSource = `
        mutation {
          alice: addUser(name: "Alice") { id }
          bob: addUser(name: "Bob") { id }
        }
      `;

      await graphql({ schema, source: setupSource });

      const postsSource = `
        mutation {
          p1: addPost(title: "Post 1", content: "Content 1", authorId: "1") { id }
          p2: addPost(title: "Post 2", content: "Content 2", authorId: "2") { id }
          p3: addPost(title: "Post 3", content: "Content 3", authorId: "1") { id }
        }
      `;

      await graphql({ schema, source: postsSource });

      const source = `
        query {
          posts {
            id
            title
            content
            author {
              id
              name
            }
          }
        }
      `;

      const result = await graphql({ schema, source });
      expect(result).to.deep.equal({
        data: {
          posts: [
            {
              id: '1',
              title: 'Post 1',
              content: 'Content 1',
              author: { id: '1', name: 'Alice' },
            },
            {
              id: '2',
              title: 'Post 2',
              content: 'Content 2',
              author: { id: '2', name: 'Bob' },
            },
            {
              id: '3',
              title: 'Post 3',
              content: 'Content 3',
              author: { id: '1', name: 'Alice' },
            },
          ],
        },
      });
    });

    it('returns an empty list when no posts exist', async () => {
      const source = `
        query {
          posts {
            id
            title
          }
        }
      `;

      const result = await graphql({ schema, source });
      expect(result).to.deep.equal({
        data: {
          posts: [],
        },
      });
    });
  });

  describe('End-to-end: CRUD flow', () => {
    it('supports full create and read flow for users and posts', async () => {
      const createUserSource = `
        mutation {
          addUser(name: "Charlie", email: "charlie@example.com") {
            id
            name
            email
          }
        }
      `;

      const createUserResult = await graphql({ schema, source: createUserSource });
      expect(createUserResult.data?.addUser).to.deep.equal({
        id: '1',
        name: 'Charlie',
        email: 'charlie@example.com',
      });

      const createPostSource = `
        mutation {
          addPost(title: "Charlie's Story", content: "Once upon a time...", authorId: "1") {
            id
            title
            content
            author {
              id
              name
            }
          }
        }
      `;

      const createPostResult = await graphql({ schema, source: createPostSource });
      expect(createPostResult.data?.addPost).to.deep.equal({
        id: '1',
        title: "Charlie's Story",
        content: 'Once upon a time...',
        author: { id: '1', name: 'Charlie' },
      });

      const queryUserSource = `
        query {
          user(id: "1") {
            id
            name
            email
            posts {
              id
              title
            }
          }
        }
      `;

      const queryUserResult = await graphql({ schema, source: queryUserSource });
      expect(queryUserResult).to.deep.equal({
        data: {
          user: {
            id: '1',
            name: 'Charlie',
            email: 'charlie@example.com',
            posts: [{ id: '1', title: "Charlie's Story" }],
          },
        },
      });

      const queryPostsSource = `
        query {
          posts {
            id
            title
            author {
              id
              name
            }
          }
        }
      `;

      const queryPostsResult = await graphql({ schema, source: queryPostsSource });
      expect(queryPostsResult).to.deep.equal({
        data: {
          posts: [
            {
              id: '1',
              title: "Charlie's Story",
              author: { id: '1', name: 'Charlie' },
            },
          ],
        },
      });
    });
  });
});