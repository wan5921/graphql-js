import { describe, it } from 'node:test';

import { expect } from 'chai';

import { parse } from '../../language/parser.ts';

import { GraphQLObjectType } from '../../type/definition.ts';
import { GraphQLString } from '../../type/scalars.ts';
import { GraphQLSchema } from '../../type/schema.ts';
import { GraphQLMaskDirective } from '../../type/directives.ts';

import { executeSync } from '../execute.ts';

const schema = new GraphQLSchema({
  directives: [GraphQLMaskDirective],
  query: new GraphQLObjectType({
    name: 'TestType',
    fields: {
      a: { type: GraphQLString },
      b: { type: GraphQLString },
      email: { type: GraphQLString },
      phone: { type: GraphQLString },
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
  email() {
    return 'user@example.com';
  },
  phone() {
    return '123-456-7890';
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

  describe('works with @mask directive', () => {
    it('masks email address', () => {
      const result = executeTestQuery(
        '{ email @mask(regex: "(.*)@(.*)", replace: "***@$2") }',
      );

      expect(result).to.deep.equal({
        data: { email: '***@example.com' },
      });
    });

    it('masks phone number', () => {
      const result = executeTestQuery(
        '{ phone @mask(regex: "(\\d{3})-(\\d{3})-(\\d{4})", replace: "***-***-$3") }',
      );

      expect(result).to.deep.equal({
        data: { phone: '***-***-7890' },
      });
    });

    it('does not mask when directive is not present', () => {
      const result = executeTestQuery('{ email, phone }');

      expect(result).to.deep.equal({
        data: { email: 'user@example.com', phone: '123-456-7890' },
      });
    });

    it('works with multiple directives', () => {
      const result = executeTestQuery(
        '{ a, b @include(if: true) @mask(regex: "(.)", replace: "$1$1") }',
      );

      expect(result).to.deep.equal({
        data: { a: 'a', b: 'bb' },
      });
    });
  });
});
