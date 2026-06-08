import { describe, it } from 'node:test';
import { expect } from 'chai';
import { buildSchema } from '../utilities/buildASTSchema';
import { graphqlSync } from '../graphql';

describe('User and Post Schema', () => {
  it('should execute { user { posts { title } } } without errors', () => {
    const schema = buildSchema(`
      type User {
        id: ID!
        name: String!
        posts: [Post!]!
      }

      type Post {
        id: ID!
        title: String!
        content: String!
        author: User!
      }

      type Query {
        user: User
      }
    `);

    const userData = {
      id: '1',
      name: 'Test User',
      posts: [
        {
          id: '101',
          title: 'First Post',
          content: 'Hello World!',
        },
      ],
    };

    const result = graphqlSync({
      schema,
      source: '{ user { posts { title } } }',
      rootValue: {
        user: () => userData,
      },
    });

    expect(result.errors).to.be.undefined;
    expect(result.data).to.deep.equal({
      user: {
        posts: [
          { title: 'First Post' },
        ],
      },
    });
  });

  it('should return errors for { user { posts { nonExist } } }', () => {
    const schema = buildSchema(`
      type User {
        id: ID!
        name: String!
        posts: [Post!]!
      }

      type Post {
        id: ID!
        title: String!
        content: String!
        author: User!
      }

      type Query {
        user: User
      }
    `);

    const userData = {
      id: '1',
      name: 'Test User',
      posts: [
        {
          id: '101',
          title: 'First Post',
          content: 'Hello World!',
        },
      ],
    };

    const result = graphqlSync({
      schema,
      source: '{ user { posts { nonExist } } }',
      rootValue: {
        user: () => userData,
      },
    });

    expect(result.errors).to.exist;
    expect(result.errors[0].message).to.include('Cannot query field "nonExist" on type "Post"');
  });
});
