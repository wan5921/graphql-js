import { describe, it } from 'node:test';

import { expect } from 'chai';

import { parse } from '../../language/parser.ts';

import { GraphQLObjectType } from '../../type/definition.ts';
import { GraphQLString } from '../../type/scalars.ts';
import { GraphQLSchema } from '../../type/schema.ts';

import { buildSchema } from '../../utilities/buildASTSchema.ts';
import { executeSync } from '../execute.ts';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'TestType',
    fields: {
      a: { type: GraphQLString },
      b: { type: GraphQLString },
    },
  }),
});

const rootValue = {
  a() {
    return 'a';
  },
  b() {
    return 'b';
  },
};

function executeTestQuery(query: string) {
  const document = parse(query);
  return executeSync({ schema, document, rootValue });
}

describe('Execute: handles directives', () => {
  describe('works without directives', () => {
    it('basic query works', () => {
      const result = executeTestQuery('{ a, b }');

      expect(result).to.deep.equal({
        data: { a: 'a', b: 'b' },
      });
    });
  });

  describe('works on scalars', () => {
    it('if true includes scalar', () => {
      const result = executeTestQuery('{ a, b @include(if: true) }');

      expect(result).to.deep.equal({
        data: { a: 'a', b: 'b' },
      });
    });

    it('if false omits on scalar', () => {
      const result = executeTestQuery('{ a, b @include(if: false) }');

      expect(result).to.deep.equal({
        data: { a: 'a' },
      });
    });

    it('unless false includes scalar', () => {
      const result = executeTestQuery('{ a, b @skip(if: false) }');

      expect(result).to.deep.equal({
        data: { a: 'a', b: 'b' },
      });
    });

    it('unless true omits scalar', () => {
      const result = executeTestQuery('{ a, b @skip(if: true) }');

      expect(result).to.deep.equal({
        data: { a: 'a' },
      });
    });
  });

  describe('works on fragment spreads', () => {
    it('if false omits fragment spread', () => {
      const result = executeTestQuery(`
        query {
          a
          ...Frag @include(if: false)
        }
        fragment Frag on TestType {
          b
        }
      `);

      expect(result).to.deep.equal({
        data: { a: 'a' },
      });
    });

    it('if true includes fragment spread', () => {
      const result = executeTestQuery(`
        query {
          a
          ...Frag @include(if: true)
        }
        fragment Frag on TestType {
          b
        }
      `);

      expect(result).to.deep.equal({
        data: { a: 'a', b: 'b' },
      });
    });

    it('unless false includes fragment spread', () => {
      const result = executeTestQuery(`
        query {
          a
          ...Frag @skip(if: false)
        }
        fragment Frag on TestType {
          b
        }
      `);

      expect(result).to.deep.equal({
        data: { a: 'a', b: 'b' },
      });
    });

    it('unless true omits fragment spread', () => {
      const result = executeTestQuery(`
        query {
          a
          ...Frag @skip(if: true)
        }
        fragment Frag on TestType {
          b
        }
      `);

      expect(result).to.deep.equal({
        data: { a: 'a' },
      });
    });
  });

  describe('works on inline fragment', () => {
    it('if false omits inline fragment', () => {
      const result = executeTestQuery(`
        query {
          a
          ... on TestType @include(if: false) {
            b
          }
        }
      `);

      expect(result).to.deep.equal({
        data: { a: 'a' },
      });
    });

    it('if true includes inline fragment', () => {
      const result = executeTestQuery(`
        query {
          a
          ... on TestType @include(if: true) {
            b
          }
        }
      `);

      expect(result).to.deep.equal({
        data: { a: 'a', b: 'b' },
      });
    });

    it('unless false includes inline fragment', () => {
      const result = executeTestQuery(`
        query {
          a
          ... on TestType @skip(if: false) {
            b
          }
        }
      `);

      expect(result).to.deep.equal({
        data: { a: 'a', b: 'b' },
      });
    });

    it('unless true includes inline fragment', () => {
      const result = executeTestQuery(`
        query {
          a
          ... on TestType @skip(if: true) {
            b
          }
        }
      `);

      expect(result).to.deep.equal({
        data: { a: 'a' },
      });
    });
  });

  describe('works on anonymous inline fragment', () => {
    it('if false omits anonymous inline fragment', () => {
      const result = executeTestQuery(`
        query {
          a
          ... @include(if: false) {
            b
          }
        }
      `);

      expect(result).to.deep.equal({
        data: { a: 'a' },
      });
    });

    it('if true includes anonymous inline fragment', () => {
      const result = executeTestQuery(`
        query {
          a
          ... @include(if: true) {
            b
          }
        }
      `);

      expect(result).to.deep.equal({
        data: { a: 'a', b: 'b' },
      });
    });

    it('unless false includes anonymous inline fragment', () => {
      const result = executeTestQuery(`
        query Q {
          a
          ... @skip(if: false) {
            b
          }
        }
      `);

      expect(result).to.deep.equal({
        data: { a: 'a', b: 'b' },
      });
    });

    it('unless true includes anonymous inline fragment', () => {
      const result = executeTestQuery(`
        query {
          a
          ... @skip(if: true) {
            b
          }
        }
      `);

      expect(result).to.deep.equal({
        data: { a: 'a' },
      });
    });
  });

  describe('works with skip and include directives', () => {
    it('include and no skip', () => {
      const result = executeTestQuery(`
        {
          a
          b @include(if: true) @skip(if: false)
        }
      `);

      expect(result).to.deep.equal({
        data: { a: 'a', b: 'b' },
      });
    });

    it('include and skip', () => {
      const result = executeTestQuery(`
        {
          a
          b @include(if: true) @skip(if: true)
        }
      `);

      expect(result).to.deep.equal({
        data: { a: 'a' },
      });
    });

    it('no include or skip', () => {
      const result = executeTestQuery(`
        {
          a
          b @include(if: false) @skip(if: false)
        }
      `);

      expect(result).to.deep.equal({
        data: { a: 'a' },
      });
    });
  });
});

describe('Execute: handles @mask directive', () => {
  const schema = buildSchema(`
    type User {
      name: String!
      phone: String!
      email: String!
      creditCard: String!
    }

    type Query {
      user: User!
    }
  `);

  const rootValue = {
    user: () => ({
      name: 'John Doe',
      phone: '+1-555-123-4567',
      email: 'john.doe@example.com',
      creditCard: '4111-1111-1111-1111',
    }),
  };

  it('returns original value without @mask directive', () => {
    const result = executeSync({
      schema,
      document: parse(`
        query {
          user {
            name
            phone
          }
        }
      `),
      rootValue,
    });

    expect(result).to.deep.equal({
      data: {
        user: {
          name: 'John Doe',
          phone: '+1-555-123-4567',
        },
      },
    });
  });

  it('applies regex replacement with @mask directive to mask phone number', () => {
    const result = executeSync({
      schema,
      document: parse(`
        query {
          user {
            name
            phone @mask(regex: "\\\\d", replace: "*")
          }
        }
      `),
      rootValue,
    });

    expect(result).to.deep.equal({
      data: {
        user: {
          name: 'John Doe',
          phone: "+*-***-***-****",
        },
      },
    });
  });

  it('applies regex replacement with @mask directive to mask email domain', () => {
    const result = executeSync({
      schema,
      document: parse(`
        query {
          user {
            name
            email @mask(regex: "@.*", replace: "@***")
          }
        }
      `),
      rootValue,
    });

    expect(result).to.deep.equal({
      data: {
        user: {
          name: 'John Doe',
          email: 'john.doe@***',
        },
      },
    });
  });

  it('applies regex replacement with @mask directive to fully mask credit card', () => {
    const result = executeSync({
      schema,
      document: parse(`
        query {
          user {
            name
            creditCard @mask(regex: ".", replace: "*")
          }
        }
      `),
      rootValue,
    });

    expect(result).to.deep.equal({
      data: {
        user: {
          name: 'John Doe',
          creditCard: '***************',
        },
      },
    });
  });

  it('applies regex replacement with global pattern', () => {
    const result = executeSync({
      schema,
      document: parse(`
        query {
          user {
            creditCard @mask(regex: "\\\\d", replace: "X")
          }
        }
      `),
      rootValue,
    });

    expect(result).to.deep.equal({
      data: {
        user: {
          creditCard: 'XXXX-XXXX-XXXX-XXXX',
        },
      },
    });
  });

  it('does not apply @mask directive to non-string fields', () => {
    const intSchema = buildSchema(`
      type Query {
        number: Int!
      }
    `);

    const intRootValue = {
      number: () => 12345,
    };

    const result = executeSync({
      schema: intSchema,
      document: parse(`
        query {
          number @mask(regex: "\\\\d", replace: "*")
        }
      `),
      rootValue: intRootValue,
    });

    expect(result).to.deep.equal({
      data: {
        number: 12345,
      },
    });
  });

  it('returns original value when regex is invalid', () => {
    const result = executeSync({
      schema,
      document: parse(`
        query {
          user {
            name @mask(regex: "[invalid", replace: "*")
          }
        }
      `),
      rootValue,
    });

    expect(result).to.deep.equal({
      data: {
        user: {
          name: 'John Doe',
        },
      },
    });
  });

  it('supports capture groups in replacement', () => {
    const result = executeSync({
      schema,
      document: parse(`
        query {
          user {
            phone @mask(regex: "^(\\\\+\\\\d)-\\\\d{3}-\\\\d{3}-(\\\\d{4})$", replace: "$1-***-***-$2")
          }
        }
      `),
      rootValue,
    });

    expect(result).to.deep.equal({
      data: {
        user: {
          phone: '+1-***-***-4567',
        },
      },
    });
  });
});
