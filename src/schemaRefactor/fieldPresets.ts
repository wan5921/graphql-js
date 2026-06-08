import {
  GraphQLInt,
  GraphQLString,
  GraphQLFieldConfigMap,
} from '../type/index.ts';

export const timestampFields: GraphQLFieldConfigMap<any, any> = {
  createdAt: {
    type: GraphQLString,
    description: 'Creation timestamp',
    resolve: (source: any) => source.createdAt || new Date().toISOString(),
  },
  updatedAt: {
    type: GraphQLString,
    description: 'Last update timestamp',
    resolve: (source: any) => source.updatedAt || new Date().toISOString(),
  },
};

export const paginationArgs: any = {
  limit: { type: GraphQLInt, defaultValue: 10 },
  offset: { type: GraphQLInt, defaultValue: 0 },
};
