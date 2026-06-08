import type {
  GraphQLEnumType,
  GraphQLFieldConfigMap,
  GraphQLInterfaceType,
  GraphQLObjectType,
} from '../../../type/definition.ts';

import type { Character, Droid, Human } from '../../starWarsData.ts';
import { getDroid, getHero, getHuman } from '../../starWarsData.ts';

import { fieldPresets } from '../fieldPresets.ts';

export function createQueryFields(params: {
  getEpisodeEnum: () => GraphQLEnumType;
  getCharacterInterface: () => GraphQLInterfaceType<Character>;
  getHumanType: () => GraphQLObjectType<Human>;
  getDroidType: () => GraphQLObjectType<Droid>;
}): GraphQLFieldConfigMap<unknown, unknown> {
  return {
    hero: {
      type: params.getCharacterInterface(),
      args: {
        episode: fieldPresets.episodeArg(
          params.getEpisodeEnum(),
          'If omitted, returns the hero of the whole saga. If provided, returns the hero of that particular episode.',
        ),
      },
      resolve: (_source, { episode }) => getHero(episode),
    },
    human: {
      type: params.getHumanType(),
      args: {
        id: fieldPresets.entityIdArg('id of the human'),
      },
      resolve: (_source, { id }) => getHuman(id),
    },
    droid: {
      type: params.getDroidType(),
      args: {
        id: fieldPresets.entityIdArg('id of the droid'),
      },
      resolve: (_source, { id }) => getDroid(id),
    },
  };
}
