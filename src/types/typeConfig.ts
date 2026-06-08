import type { GraphQLObjectTypeConfig } from '../type/definition';

import { GraphQLObjectType } from '../type/definition';

export interface TypeConfig<TSource = any, TContext = any> {
  name: string;
  config: GraphQLObjectTypeConfig<TSource, TContext>;
}

export function createTypeConfig<TSource = any, TContext = any>(
  name: string,
  config: GraphQLObjectTypeConfig<TSource, TContext>,
): TypeConfig<TSource, TContext> {
  return { name, config };
}

export function buildTypeFromConfig<TSource = any, TContext = any>(
  typeConfig: TypeConfig<TSource, TContext>,
): GraphQLObjectType<TSource, TContext> {
  return new GraphQLObjectType(typeConfig.config);
}

export function buildTypesFromConfigs(
  typeConfigs: TypeConfig[],
): Map<string, GraphQLObjectType> {
  const typeMap = new Map<string, GraphQLObjectType>();

  for (const typeConfig of typeConfigs) {
    typeMap.set(typeConfig.name, buildTypeFromConfig(typeConfig));
  }

  return typeMap;
}
