import { describe, it } from 'node:test';

import { expect } from 'chai';

import {
  GraphQLObjectType,
  GraphQLNonNull,
} from '../../type/definition.ts';
import { GraphQLString } from '../../type/scalars.ts';

import {
  idField,
  nameField,
  timestampFields,
  pageInfoFields,
  paginationEdgeFields,
} from '../fieldPresets/commonFields.ts';

describe('fieldPresets', () => {
  describe('idField', () => {
    it('generates a NonNull String field for id', () => {
      const testType = new GraphQLObjectType({
        name: 'Test',
        fields: { id: idField },
      });

      const fields = testType.getFields();
      expect(fields.id.name).to.equal('id');
      expect(fields.id.type).to.be.instanceOf(GraphQLNonNull);
      expect(fields.id.description).to.equal(
        'The unique identifier of the record.',
      );
    });
  });

  describe('nameField', () => {
    it('generates a String field for name', () => {
      const testType = new GraphQLObjectType({
        name: 'Test',
        fields: { name: nameField },
      });

      const fields = testType.getFields();
      expect(fields.name.name).to.equal('name');
      expect(fields.name.type).to.equal(GraphQLString);
      expect(fields.name.description).to.equal('The name of the record.');
    });
  });

  describe('timestampFields', () => {
    it('generates createdAt and updatedAt fields', () => {
      const testType = new GraphQLObjectType({
        name: 'Test',
        fields: timestampFields,
      });

      const fields = testType.getFields();
      expect(fields.createdAt.name).to.equal('createdAt');
      expect(fields.createdAt.type).to.equal(GraphQLString);
      expect(fields.createdAt.description).to.equal(
        'The timestamp when this record was created.',
      );
      expect(fields.updatedAt.name).to.equal('updatedAt');
      expect(fields.updatedAt.type).to.equal(GraphQLString);
      expect(fields.updatedAt.description).to.equal(
        'The timestamp when this record was last updated.',
      );
    });
  });

  describe('pageInfoFields', () => {
    it('generates pageInfo fields with correct types', () => {
      const pageInfoType = new GraphQLObjectType({
        name: 'PageInfo',
        fields: pageInfoFields,
      });

      const fields = pageInfoType.getFields();
      expect(fields.hasNextPage.name).to.equal('hasNextPage');
      expect(fields.hasNextPage.type).to.be.instanceOf(GraphQLNonNull);
      expect(fields.hasPreviousPage.name).to.equal('hasPreviousPage');
      expect(fields.hasPreviousPage.type).to.be.instanceOf(GraphQLNonNull);
      expect(fields.startCursor.name).to.equal('startCursor');
      expect(fields.startCursor.type).to.equal(GraphQLString);
      expect(fields.endCursor.name).to.equal('endCursor');
      expect(fields.endCursor.type).to.equal(GraphQLString);
    });
  });

  describe('paginationEdgeFields', () => {
    it('generates edge fields with cursor', () => {
      const edgeType = new GraphQLObjectType({
        name: 'Edge',
        fields: paginationEdgeFields,
      });

      const fields = edgeType.getFields();
      expect(fields.cursor.name).to.equal('cursor');
      expect(fields.cursor.type).to.be.instanceOf(GraphQLNonNull);
      expect(fields.cursor.description).to.equal(
        'The cursor for this edge.',
      );
    });
  });

  describe('composable fieldPresets', () => {
    it('allows combining multiple fieldPresets into one ObjectType', () => {
      const testType = new GraphQLObjectType({
        name: 'Composed',
        fields: {
          ...timestampFields,
          id: idField,
          name: nameField,
        },
      });

      const fields = testType.getFields();
      expect(Object.keys(fields)).to.deep.equal([
        'createdAt',
        'updatedAt',
        'id',
        'name',
      ]);
      expect(fields.id).to.exist;
      expect(fields.name).to.exist;
      expect(fields.createdAt).to.exist;
      expect(fields.updatedAt).to.exist;
    });
  });
});