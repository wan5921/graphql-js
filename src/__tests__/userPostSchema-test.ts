import { describe, it } from 'node:test';

import { expect } from 'chai';

import { graphql } from '../graphql.ts';

import { resetUserPostData } from './userPostData.ts';
import { UserPostSchema as schema } from './userPostSchema.ts';

describe('UserPostSchema', () => {
  it('supports querying a user and all posts', async () => {
    resetUserPostData();

    const source = `
      {
        user(id: 1) {
          id
          name
        }
        posts {
          id
          title
        }
      }
    `;

    const result = await graphql({ schema, source });

    expect(result).to.deep.equal({
      data: {
        user: {
          id: 1,
          name: 'Ada',
        },
        posts: [
          {
            id: 1,
            title: 'Hello GraphQL',
          },
        ],
      },
    });
  });

  it('supports adding users and posts through mutations', async () => {
    resetUserPostData();

    const addUserResult = await graphql({
      schema,
      source: `
        mutation {
          addUser(name: "Grace") {
            id
            name
          }
        }
      `,
    });

    expect(addUserResult).to.deep.equal({
      data: {
        addUser: {
          id: 2,
          name: 'Grace',
        },
      },
    });

    const addPostResult = await graphql({
      schema,
      source: `
        mutation {
          addPost(title: "Typed Schema", userId: 2) {
            id
            title
          }
        }
      `,
    });

    expect(addPostResult).to.deep.equal({
      data: {
        addPost: {
          id: 2,
          title: 'Typed Schema',
        },
      },
    });

    const postsResult = await graphql({
      schema,
      source: `
        {
          posts {
            id
            title
          }
        }
      `,
    });

    expect(postsResult).to.deep.equal({
      data: {
        posts: [
          {
            id: 1,
            title: 'Hello GraphQL',
          },
          {
            id: 2,
            title: 'Typed Schema',
          },
        ],
      },
    });
  });
});
