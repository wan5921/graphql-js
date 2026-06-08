import { describe, it } from 'node:test';

import { expect } from 'chai';

import { GraphQLNonNull } from '../definition.ts';
import { GraphQLInt, GraphQLString } from '../scalars.ts';

import {
  idField,
  nameField,
  timestampFields,
  paginationFields,
  mergeFields,
} from '../fieldPresets.ts';

describe('fieldPresets', () => {
  describe('idField', () => {
    it('returns a non-null String field with default description', () => {
      const field = idField();
      expect(field.type).to.be.instanceof(GraphQLNonNull);
      expect(field.type.toString()).to.equal('String!');
      expect(field.description).to.equal('The id of the object.');
    });

    it('accepts a custom description', () => {
      const field = idField('Custom id description');
      expect(field.description).to.equal('Custom id description');
    });
  });

  describe('nameField', () => {
    it('returns a nullable String field with default description', () => {
      const field = nameField();
      expect(field.type).to.equal(GraphQLString);
      expect(field.description).to.equal('The name of the object.');
    });

    it('accepts a custom description', () => {
      const field = nameField('Custom name description');
      expect(field.description).to.equal('Custom name description');
    });
  });

  describe('timestampFields', () => {
    it('returns createdAt and updatedAt fields', () => {
      const fields = timestampFields();
      expect(fields).to.have.property('createdAt');
      expect(fields).to.have.property('updatedAt');
      expect(fields.createdAt.type).to.equal(GraphQLString);
      expect(fields.updatedAt.type).to.equal(GraphQLString);
      expect(fields.createdAt.description).to.equal(
        'The creation timestamp of the object.',
      );
      expect(fields.updatedAt.description).to.equal(
        'The last update timestamp of the object.',
      );
    });
  });

  describe('paginationFields', () => {
    it('returns offset, limit, and totalCount fields', () => {
      const fields = paginationFields();
      expect(fields).to.have.property('offset');
      expect(fields).to.have.property('limit');
      expect(fields).to.have.property('totalCount');
      expect(fields.offset.type).to.equal(GraphQLInt);
      expect(fields.limit.type).to.equal(GraphQLInt);
      expect(fields.totalCount.type).to.equal(GraphQLInt);
    });
  });

  describe('mergeFields', () => {
    it('merges multiple field config maps', () => {
      const base = { id: idField(), name: nameField() };
      const extra = timestampFields();
      const merged = mergeFields(base, extra);

      expect(merged).to.have.property('id');
      expect(merged).to.have.property('name');
      expect(merged).to.have.property('createdAt');
      expect(merged).to.have.property('updatedAt');
    });

    it('later field maps override earlier ones for same keys', () => {
      const base = { id: idField('Base id') };
      const override = { id: idField('Override id') };
      const merged = mergeFields(base, override);

      expect(merged.id.description).to.equal('Override id');
    });

    it('returns empty object when no arguments provided', () => {
      const merged = mergeFields();
      expect(Object.keys(merged)).to.deep.equal([]);
    });
  });
});
