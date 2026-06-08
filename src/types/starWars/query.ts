import type {
  GraphQLEnumType,
  GraphQLFieldConfig,
  GraphQLFieldResolver,
  GraphQLInterfaceType,
  GraphQLObjectType,
} from '../../type/definition.ts';
import { GraphQLNonNull } from '../../type/definition.ts';
import { GraphQLString } from '../../type/scalars.ts';

export function buildQueryFields(
  characterInterface: GraphQLInterfaceType,
  humanType: GraphQLObjectType,
  droidType: GraphQLObjectType,
  episodeEnum: GraphQLEnumType,
  getHero: GraphQLFieldResolver<unknown, unknown>,
  getHuman: GraphQLFieldResolver<unknown, unknown>,
  getDroid: GraphQLFieldResolver<unknown, unknown>,
): Record<string, GraphQLFieldConfig<unknown, unknown>> {
  return {
    hero: {
      type: characterInterface,
      args: {
        episode: {
          description:
            'If omitted, returns the hero of the whole saga. If provided, returns the hero of that particular episode.',
          type: episodeEnum,
        },
      },
      resolve: getHero,
    },
    human: {
      type: humanType,
      args: {
        id: {
          description: 'id of the human',
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: getHuman,
    },
    droid: {
      type: droidType,
      args: {
        id: {
          description: 'id of the droid',
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: getDroid,
    },
  };
}