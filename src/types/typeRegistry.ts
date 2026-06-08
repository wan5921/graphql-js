import { GraphQLObjectType } from '../type/definition';

import type { TypeConfig } from './typeConfig';

import { buildTypeFromConfig } from './typeConfig';

export class TypeRegistry {
  private _typeMap: Map<string, GraphQLObjectType> = new Map();
  private _configMap: Map<string, TypeConfig> = new Map();

  registerConfig(typeConfig: TypeConfig): void {
    this._configMap.set(typeConfig.name, typeConfig);
  }

  registerConfigs(typeConfigs: TypeConfig[]): void {
    for (const config of typeConfigs) {
      this.registerConfig(config);
    }
  }

  buildAll(): void {
    for (const [name, config] of this._configMap) {
      if (!this._typeMap.has(name)) {
        this._typeMap.set(name, buildTypeFromConfig(config));
      }
    }
  }

  getType(name: string): GraphQLObjectType | undefined {
    return this._typeMap.get(name);
  }

  getTypeOrBuild(name: string): GraphQLObjectType | undefined {
    if (!this._typeMap.has(name)) {
      const config = this._configMap.get(name);
      if (config) {
        const type = buildTypeFromConfig(config);
        this._typeMap.set(name, type);
        return type;
      }
    }
    return this._typeMap.get(name);
  }

  getAllTypes(): GraphQLObjectType[] {
    return Array.from(this._typeMap.values());
  }

  getAllConfigs(): TypeConfig[] {
    return Array.from(this._configMap.values());
  }
}

export const globalTypeRegistry = new TypeRegistry();
