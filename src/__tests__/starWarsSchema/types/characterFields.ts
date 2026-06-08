import type {
  GraphQLEnumType,
  GraphQLFieldConfigMap,
  GraphQLInterfaceType,
} from '../../../type/definition.ts';
import { GraphQLString } from '../../../type/scalars.ts';

import type { Character, Droid, Human } from '../../starWarsData.ts';

import { fieldPresets } from '../fieldPresets.ts';

export function createCharacterFields(params: {
  getEpisodeEnum: () => GraphQLEnumType;
  getCharacterInterface: () => GraphQLInterfaceType<Human | Droid>;
}): GraphQLFieldConfigMap<Character, unknown> {
  return {
    id: fieldPresets.characterId('The id of the character.'),
    name: fieldPresets.characterName('The name of the character.'),
    friends: fieldPresets.friends(
      params.getCharacterInterface(),
      'The friends of the character, or an empty list if they have none.',
    ),
    appearsIn: fieldPresets.appearsIn(
      params.getEpisodeEnum(),
      'Which movies they appear in.',
    ),
    secretBackstory: {
      type: GraphQLString,
      description: 'All secrets about their past.',
    },
  };
}
