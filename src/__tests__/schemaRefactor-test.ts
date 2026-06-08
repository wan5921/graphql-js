import { describe, it } from 'node:test';
import { expect } from 'chai';

import { graphql } from '../graphql.ts';
import { schema } from '../schemaRefactor/index.ts';

describe('Refactored Schema (GraphQLObjectType with fieldPresets)', () => {
  it('correctly generates schema and resolves fieldPresets like pagination and timestamps', async () => {
    const query = `
      query {
        users(limit: 1) {
          id
          username
          createdAt
          posts(limit: 1, offset: 1) {
            id
            title
            author {
              id
            }
          }
        }
      }
    `;

    const contextValue = {
      users: [
        {
          id: '1',
          username: 'alice',
          createdAt: '2023-01-01T00:00:00Z',
          posts: [
            { id: 'p1', title: 'Post 1', author: { id: '1' } },
            { id: 'p2', title: 'Post 2', author: { id: '1' } },
            { id: 'p3', title: 'Post 3', author: { id: '1' } },
          ],
        },
        {
          id: '2',
          username: 'bob',
          createdAt: '2023-01-02T00:00:00Z',
          posts: [],
        },
      ],
    };

    const result = await graphql({
      schema,
      source: query,
      contextValue,
    });

    expect(result.errors).to.be.undefined;
    expect(result.data).to.deep.equal({
      users: [
        {
          id: '1',
          username: 'alice',
          createdAt: '2023-01-01T00:00:00Z',
          posts: [
            {
              id: 'p2',
              title: 'Post 2',
              author: { id: '1' },
            },
          ],
        },
      ],
    });
  });

  it('provides default timestamp when not present on source', async () => {
    const query = `
      query {
        users(limit: 1) {
          updatedAt
        }
      }
    `;

    const contextValue = {
      users: [
        {
          id: '1',
          username: 'alice',
          // updatedAt is intentionally missing
        },
      ],
    };

    const result = await graphql({
      schema,
      source: query,
      contextValue,
    });

    expect(result.errors).to.be.undefined;
    // @ts-expect-error
    const updatedAt = result.data?.users[0]?.updatedAt;
    expect(updatedAt).to.be.a('string');
    expect(new Date(updatedAt).getTime()).to.not.be.NaN;
  });
});
