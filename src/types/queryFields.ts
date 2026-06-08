import type {
  GraphQLFieldConfigMap,
  GraphQLInterfaceType,
  GraphQLObjectType,
} from '../type/definition.ts';
import { GraphQLNonNull } from '../type/definition.ts';
import { GraphQLString } from '../type/scalars.ts';

import { getHero, getHuman, getDroid } from '../__tests__/starWarsData.ts';
import { episodeEnum } from './episodeEnum.ts';

export function getQueryFields(
  characterInterface: GraphQLInterfaceType,
  humanType: GraphQLObjectType,
  droidType: GraphQLObjectType,
): GraphQLFieldConfigMap<any, any> {
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
      resolve: (_source, { episode }) => getHero(episode),
    },
    human: {
      type: humanType,
      args: {
        id: {
          description: 'id of the human',
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: (_source, { id }) => getHuman(id),
    },
    droid: {
      type: droidType,
      args: {
        id: {
          description: 'id of the droid',
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: (_source, { id }) => getDroid(id),
    },
  };
}
