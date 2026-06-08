import type { ObjMap } from '../jsutils/ObjMap.ts';

import type {
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
} from './definition.ts';
import { GraphQLInt, GraphQLString } from './scalars.ts';
import { GraphQLNonNull } from './definition.ts';

export function idField<TSource, TContext>(
  description?: string,
): GraphQLFieldConfig<TSource, TContext> {
  return {
    type: new GraphQLNonNull(GraphQLString),
    description: description ?? 'The id of the object.',
  };
}

export function nameField<TSource, TContext>(
  description?: string,
): GraphQLFieldConfig<TSource, TContext> {
  return {
    type: GraphQLString,
    description: description ?? 'The name of the object.',
  };
}

export function timestampFields<TSource, TContext>(): GraphQLFieldConfigMap<
  TSource,
  TContext
> {
  return {
    createdAt: {
      type: GraphQLString,
      description: 'The creation timestamp of the object.',
    },
    updatedAt: {
      type: GraphQLString,
      description: 'The last update timestamp of the object.',
    },
  };
}

export function paginationFields<TSource, TContext>(): GraphQLFieldConfigMap<
  TSource,
  TContext
> {
  return {
    offset: {
      type: GraphQLInt,
      description: 'The offset for pagination.',
    },
    limit: {
      type: GraphQLInt,
      description: 'The limit for pagination.',
    },
    totalCount: {
      type: GraphQLInt,
      description: 'The total count of items.',
    },
  };
}

export function mergeFields<TSource, TContext>(
  ...fieldMaps: Array<GraphQLFieldConfigMap<TSource, TContext>>
): GraphQLFieldConfigMap<TSource, TContext> {
  const result: ObjMap<GraphQLFieldConfig<TSource, TContext>> = {};
  for (const fieldMap of fieldMaps) {
    for (const key of Object.keys(fieldMap)) {
      result[key] = fieldMap[key];
    }
  }
  return result;
}
