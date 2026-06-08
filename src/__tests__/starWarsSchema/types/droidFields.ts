import type {
  GraphQLEnumType,
  GraphQLFieldConfigMap,
  GraphQLInterfaceType,
} from '../../../type/definition.ts';
import { GraphQLString } from '../../../type/scalars.ts';

import type { Droid } from '../../starWarsData.ts';
import { getFriends } from '../../starWarsData.ts';

import { fieldPresets } from '../fieldPresets.ts';

export function createDroidFields(params: {
  getEpisodeEnum: () => GraphQLEnumType;
  getCharacterInterface: () => GraphQLInterfaceType;
}): GraphQLFieldConfigMap<Droid, unknown> {
  return {
    id: fieldPresets.characterId('The id of the droid.'),
    name: fieldPresets.characterName('The name of the droid.'),
    friends: fieldPresets.friends(
      params.getCharacterInterface(),
      'The friends of the droid, or an empty list if they have none.',
      (droid) => getFriends(droid),
    ),
    appearsIn: fieldPresets.appearsIn(
      params.getEpisodeEnum(),
      'Which movies they appear in.',
    ),
    secretBackstory: {
      type: GraphQLString,
      description: 'Construction date and the name of the designer.',
      resolve() {
        throw new Error('secretBackstory is secret.');
      },
    },
    primaryFunction: {
      type: GraphQLString,
      description: 'The primary function of the droid.',
    },
  };
}
