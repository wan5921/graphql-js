import { describe, it } from 'node:test';

import { expect } from 'chai';

import { parse } from '../../language/parser.ts';

import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from '../../type/definition.ts';
import { GraphQLMaskDirective, GraphQLString } from '../../type/index.ts';
import { GraphQLSchema } from '../../type/schema.ts';
import { buildSchema } from '../../utilities/buildASTSchema.ts';

import { executeSync } from '../execute.ts';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'TestType',
    fields: {
      name: { type: GraphQLString },
      email: { type: GraphQLString },
      phone: { type: GraphQLString },
      names: { type: new GraphQLList(GraphQLString) },
      requiredName: {
        type: new GraphQLNonNull(GraphQLString),
      },
    },
  }),
  directives: [GraphQLMaskDirective],
});

const rootValue = {
  name() {
    return 'John Doe';
  },
  email() {
    return 'john.doe@example.com';
  },
  phone() {
    return '123-456-7890';
  },
  names() {
    return ['Alice Smith', 'Bob Johnson', 'Charlie Brown'];
  },
  requiredName() {
    return 'Required User';
  },
};

function executeTestQuery(query: string) {
  const document = parse(query);
  return executeSync({ schema, document, rootValue });
}

describe('Execute: handles @mask directive', () => {
  describe('works without @mask directive', () => {
    it('basic query works', () => {
      const result = executeTestQuery('{ name }');

      expect(result).to.deep.equal({
        data: { name: 'John Doe' },
      });
    });
  });

  describe('works on string fields', () => {
    it('applies regex replacement on string field', () => {
      const result = executeTestQuery(
        '{ name @mask(regex: " ", replace: "_") }',
      );

      expect(result).to.deep.equal({
        data: { name: 'John_Doe' },
      });
    });

    it('applies complex regex replacement', () => {
      const result = executeTestQuery(
        '{ email @mask(regex: "[a-z]\\\\.", replace: "X.") }',
      );

      expect(result).to.deep.equal({
        data: { email: 'jXXX.dXXX.e@example.com' },
      });
    });

    it('masks phone number with regex', () => {
      const result = executeTestQuery(
        '{ phone @mask(regex: "\\\\d", replace: "*") }',
      );

      expect(result).to.deep.equal({
        data: { phone: '***-***-****' },
      });
    });

    it('does not affect field without @mask directive', () => {
      const result = executeTestQuery('{ name, email }');

      expect(result).to.deep.equal({
        data: { name: 'John Doe', email: 'john.doe@example.com' },
      });
    });

    it('applies @mask to one field but not another', () => {
      const result = executeTestQuery(
        '{ name @mask(regex: " ", replace: "_"), email }',
      );

      expect(result).to.deep.equal({
        data: { name: 'John_Doe', email: 'john.doe@example.com' },
      });
    });
  });

  describe('works with variables', () => {
    it('applies @mask with variable arguments', () => {
      const document = parse(
        'query ($pattern: String!, $replacement: String!) { name @mask(regex: $pattern, replace: $replacement) }',
      );
      const result = executeSync({
        schema,
        document,
        rootValue,
        variableValues: { pattern: ' ', replacement: '-' },
      });

      expect(result).to.deep.equal({
        data: { name: 'John-Doe' },
      });
    });
  });

  describe('works on list fields', () => {
    it('applies @mask to each item in list', () => {
      const result = executeTestQuery(
        '{ names @mask(regex: " ", replace: "_") }',
      );

      expect(result).to.deep.equal({
        data: { names: ['Alice_Smith', 'Bob_Johnson', 'Charlie_Brown'] },
      });
    });
  });

  describe('works on non-null fields', () => {
    it('applies @mask to non-null string field', () => {
      const result = executeTestQuery(
        '{ requiredName @mask(regex: " ", replace: "_") }',
      );

      expect(result).to.deep.equal({
        data: { requiredName: 'Required_User' },
      });
    });
  });

  describe('works with buildSchema', () => {
    it('defines and uses @mask directive via SDL', () => {
      const sdlSchema = buildSchema(`
        directive @mask(regex: String!, replace: String!) on FIELD

        type Query {
          name: String
          email: String
        }
      `);

      const sdlRootValue = {
        name: () => 'Jane Smith',
        email: () => 'jane.smith@test.com',
      };

      const document = parse(
        '{ name @mask(regex: " ", replace: "_"), email }',
      );
      const result = executeSync({
        schema: sdlSchema,
        document,
        rootValue: sdlRootValue,
      });

      expect(result).to.deep.equal({
        data: { name: 'Jane_Smith', email: 'jane.smith@test.com' },
      });
    });

    it('multiple @mask directives on different fields', () => {
      const sdlSchema = buildSchema(`
        directive @mask(regex: String!, replace: String!) on FIELD

        type Query {
          firstName: String
          lastName: String
        }
      `);

      const sdlRootValue = {
        firstName: () => 'john',
        lastName: () => 'doe',
      };

      const document = parse(
        '{ firstName @mask(regex: "j", replace: "J"), lastName @mask(regex: "d", replace: "D") }',
      );
      const result = executeSync({
        schema: sdlSchema,
        document,
        rootValue: sdlRootValue,
      });

      expect(result).to.deep.equal({
        data: { firstName: 'John', lastName: 'Doe' },
      });
    });
  });

  describe('edge cases', () => {
    it('handles non-matching regex', () => {
      const result = executeTestQuery(
        '{ name @mask(regex: "xyz", replace: "ABC") }',
      );

      expect(result).to.deep.equal({
        data: { name: 'John Doe' },
      });
    });

    it('handles empty replacement string', () => {
      const result = executeTestQuery(
        '{ name @mask(regex: " ", replace: "") }',
      );

      expect(result).to.deep.equal({
        data: { name: 'JohnDoe' },
      });
    });

    it('handles special regex characters', () => {
      const result = executeTestQuery(
        '{ email @mask(regex: "\\\\.", replace: "[DOT]") }',
      );

      expect(result).to.deep.equal({
        data: { email: 'john[DOT]doe@example[DOT]com' },
      });
    });
  });
});
