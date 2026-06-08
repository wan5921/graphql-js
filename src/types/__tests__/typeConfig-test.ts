import assert from 'node:assert';
import { describe, it } from 'node:test';

import {
  idPreset,
  mergeFieldConfigs,
  timestampPreset,
} from '../fieldPresets.ts';
import {
  buildTypeFromConfig,
  buildTypesFromConfigs,
  createTypeConfig,
} from '../typeConfig.ts';
import { TypeRegistry } from '../typeRegistry.ts';

import { GraphQLObjectType } from '../../type/definition.ts';
import { GraphQLString } from '../../type/scalars.ts';

describe('TypeConfig', () => {
  describe('createTypeConfig', () => {
    it('should create a type config object', () => {
      const config = createTypeConfig('Test', {
        name: 'Test',
        fields: {
          field1: { type: GraphQLString },
        },
      });

      assert.strictEqual(config.name, 'Test');
      assert.strictEqual(config.config.name, 'Test');
    });
  });

  describe('buildTypeFromConfig', () => {
    it('should build a GraphQLObjectType from a config', () => {
      const typeConfig = createTypeConfig('Test', {
        name: 'Test',
        fields: {
          field1: { type: GraphQLString },
        },
      });

      const type = buildTypeFromConfig(typeConfig);
      assert.ok(type instanceof GraphQLObjectType);
      assert.strictEqual(type.name, 'Test');
    });
  });

  describe('buildTypesFromConfigs', () => {
    it('should build multiple types from configs', () => {
      const config1 = createTypeConfig('Type1', {
        name: 'Type1',
        fields: { field1: { type: GraphQLString } },
      });
      const config2 = createTypeConfig('Type2', {
        name: 'Type2',
        fields: { field2: { type: GraphQLString } },
      });

      const typeMap = buildTypesFromConfigs([config1, config2]);

      assert.strictEqual(typeMap.size, 2);
      assert.ok(typeMap.get('Type1') instanceof GraphQLObjectType);
      assert.ok(typeMap.get('Type2') instanceof GraphQLObjectType);
    });
  });
});

describe('FieldPresets', () => {
  describe('idPreset', () => {
    it('should create an id field config', () => {
      const fields = idPreset();
      assert.ok(Object.keys(fields).includes('id'));
      assert.ok(fields.id.hasOwnProperty('type'));
    });

    it('should allow custom field name', () => {
      const fields = idPreset({ fieldName: 'customId' });
      assert.ok(Object.keys(fields).includes('customId'));
    });
  });

  describe('timestampPreset', () => {
    it('should create timestamp fields by default', () => {
      const fields = timestampPreset();
      assert.ok(Object.keys(fields).includes('createdAt'));
      assert.ok(Object.keys(fields).includes('updatedAt'));
    });

    it('should allow excluding fields', () => {
      const fields = timestampPreset({ includeUpdatedAt: false });
      assert.ok(Object.keys(fields).includes('createdAt'));
      assert.ok(!Object.keys(fields).includes('updatedAt'));
    });
  });

  describe('mergeFieldConfigs', () => {
    it('should merge multiple field configs', () => {
      const idFields = idPreset();
      const timestampFields = timestampPreset();
      const customFields = { customField: { type: GraphQLString } };

      const merged = mergeFieldConfigs(idFields, timestampFields, customFields);

      assert.ok(Object.keys(merged).includes('id'));
      assert.ok(Object.keys(merged).includes('createdAt'));
      assert.ok(Object.keys(merged).includes('updatedAt'));
      assert.ok(Object.keys(merged).includes('customField'));
    });
  });
});

describe('TypeRegistry', () => {
  describe('TypeRegistry operations', () => {
    it('should register and build types', () => {
      const registry = new TypeRegistry();
      const config = createTypeConfig('Test', {
        name: 'Test',
        fields: { field1: { type: GraphQLString } },
      });

      registry.registerConfig(config);
      registry.buildAll();

      const type = registry.getType('Test');
      assert.ok(type);
      assert.strictEqual(type?.name, 'Test');
    });

    it('should build type on demand', () => {
      const registry = new TypeRegistry();
      const config = createTypeConfig('Test', {
        name: 'Test',
        fields: { field1: { type: GraphQLString } },
      });

      registry.registerConfig(config);

      const type = registry.getTypeOrBuild('Test');
      assert.ok(type);
    });
  });
});
