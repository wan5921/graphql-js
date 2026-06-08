import { GraphQLFieldConfig, GraphQLInputType, GraphQLList, GraphQLObjectType, GraphQLOutputType } from '../type/definition';

import { GraphQLID, GraphQLInt, GraphQLString } from '../type/scalars';
import { GraphQLNonNull } from '../type/definition';

export type FieldPreset<TSource = any, TContext = any, TArgs = any> =
  | GraphQLFieldConfig<TSource, TContext, TArgs>
  | (() => GraphQLFieldConfig<TSource, TContext, TArgs>);

export interface PresetOptions {
  [key: string]: unknown;
}

export const paginationPreset = (options: {
  itemType: GraphQLOutputType;
  cursorType?: GraphQLInputType;
}): {
  pageInfo: GraphQLFieldConfig<any, any>;
  edges: GraphQLFieldConfig<any, any>;
} => {
  const cursorType = options.cursorType || GraphQLString;

  return {
    pageInfo: {
      type: new GraphQLNonNull(
        new GraphQLObjectType({
          name: 'PageInfo',
          fields: {
            hasNextPage: { type: new GraphQLNonNull(GraphQLInt) },
            hasPreviousPage: { type: new GraphQLNonNull(GraphQLInt) },
            startCursor: { type: cursorType },
            endCursor: { type: cursorType },
          },
        }),
      ),
    },
    edges: {
      type: new GraphQLNonNull(
        new GraphQLList(
          new GraphQLNonNull(
            new GraphQLObjectType({
              name: 'Edge',
              fields: {
                cursor: { type: new GraphQLNonNull(cursorType) },
                node: { type: new GraphQLNonNull(options.itemType) },
              },
            }),
          ),
        ),
      ),
    },
  };
};

export const timestampPreset = (options: {
  includeCreatedAt?: boolean;
  includeUpdatedAt?: boolean;
  createdAtFieldName?: string;
  updatedAtFieldName?: string;
} = {}): {
  [key: string]: GraphQLFieldConfig<any, any>;
} => {
  const {
    includeCreatedAt = true,
    includeUpdatedAt = true,
    createdAtFieldName = 'createdAt',
    updatedAtFieldName = 'updatedAt',
  } = options;

  const fields: { [key: string]: GraphQLFieldConfig<any, any> } = {};

  if (includeCreatedAt) {
    fields[createdAtFieldName] = {
      type: GraphQLString,
    };
  }

  if (includeUpdatedAt) {
    fields[updatedAtFieldName] = {
      type: GraphQLString,
    };
  }

  return fields;
};

export const idPreset = (options: {
  fieldName?: string;
  type?: GraphQLOutputType;
} = {}): { [key: string]: GraphQLFieldConfig<any, any> } => {
  const { fieldName = 'id', type = GraphQLID } = options;

  return {
    [fieldName]: {
      type: new GraphQLNonNull(type),
    },
  };
};

export function mergeFieldConfigs(...configs: Array<{
  [key: string]: GraphQLFieldConfig<any, any>;
}>): { [key: string]: GraphQLFieldConfig<any, any> } {
  return configs.reduce((result, config) => {
    return {
      ...result,
      ...config,
    };
  }, {});
}

export function applyPreset<TSource = any, TContext = any, TArgs = any>(
  preset: FieldPreset<TSource, TContext, TArgs>,
  options?: PresetOptions,
): GraphQLFieldConfig<TSource, TContext, TArgs> {
  return typeof preset === 'function' ? preset(options) : preset;
}
