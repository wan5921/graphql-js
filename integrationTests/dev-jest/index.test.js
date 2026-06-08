/* eslint-disable import/unambiguous */
/* eslint-disable import/no-commonjs */
/* eslint-disable no-undef */
const { buildSchema, graphql, isObjectType } = require('graphql');

class FakeGraphQLObjectType {
  get [Symbol.toStringTag]() {
    return 'GraphQLObjectType';
  }
}

const schema = buildSchema(`
  type Query {
    user: User
  }

  type User {
    posts: [Post]
  }

  type Post {
    title: String
  }
`);

const rootValue = {
  user: {
    posts: [{ title: 'First Post' }],
  },
};

describe('Jest development mode tests', () => {
  test('isObjectType should throw in development mode for instances from another realm/module', () => {
    expect(() => isObjectType(new FakeGraphQLObjectType())).toThrowError(
      /from another module or realm/,
    );
  });

  test('buildSchema should execute a nested User.posts.title query without errors', async () => {
    const result = await graphql({
      schema,
      source: '{ user { posts { title } } }',
      rootValue,
    });

    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      user: {
        posts: [{ title: 'First Post' }],
      },
    });
  });

  test('buildSchema should report validation errors for unknown Post fields', async () => {
    const result = await graphql({
      schema,
      source: '{ user { posts { nonExist } } }',
      rootValue,
    });

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining(
            "Cannot query field 'nonExist' on type 'Post'",
          ),
        }),
      ]),
    );
  });
});
