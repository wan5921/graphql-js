import type { GraphQLFieldConfig } from '../../type/definition.ts';
import { GraphQLNonNull } from '../../type/definition.ts';
import { GraphQLString } from '../../type/scalars.ts';

export const idField: GraphQLFieldConfig<unknown, unknown> = {
  type: new GraphQLNonNull(GraphQLString),
  description: 'The unique identifier of the record.',
};

export const nameField: GraphQLFieldConfig<unknown, unknown> = {
  type: GraphQLString,
  description: 'The name of the record.',
};

export const createdAtField: GraphQLFieldConfig<unknown, unknown> = {
  type: GraphQLString,
  description: 'The timestamp when this record was created.',
};

export const updatedAtField: GraphQLFieldConfig<unknown, unknown> = {
  type: GraphQLString,
  description: 'The timestamp when this record was last updated.',
};

export const timestampFields: Record<string, GraphQLFieldConfig<unknown, unknown>> = {
  createdAt: createdAtField,
  updatedAt: updatedAtField,
};

export const pageInfoFields: Record<string, GraphQLFieldConfig<unknown, unknown>> = {
  hasNextPage: {
    type: new GraphQLNonNull(GraphQLString),
    description: 'Whether there are more pages available after the current page.',
  },
  hasPreviousPage: {
    type: new GraphQLNonNull(GraphQLString),
    description: 'Whether there are more pages available before the current page.',
  },
  startCursor: {
    type: GraphQLString,
    description: 'The cursor pointing to the first edge in the current page.',
  },
  endCursor: {
    type: GraphQLString,
    description: 'The cursor pointing to the last edge in the current page.',
  },
};

export const paginationEdgeFields: Record<string, GraphQLFieldConfig<unknown, unknown>> = {
  cursor: {
    type: new GraphQLNonNull(GraphQLString),
    description: 'The cursor for this edge.',
  },
};