import type {
  GraphQLEnumType,
  GraphQLFieldConfigMap,
  GraphQLInterfaceType,
} from '../../../type/definition.ts';
import { GraphQLString } from '../../../type/scalars.ts';

import type { Human } from '../../starWarsData.ts';
import { getFriends } from '../../starWarsData.ts';

import { fieldPresets } from '../fieldPresets.ts';

export function createHumanFields(params: {
  getEpisodeEnum: () => GraphQLEnumType;
  getCharacterInterface: () => GraphQLInterfaceType;
}): GraphQLFieldConfigMap<Human, unknown> {
  return {
    id: fieldPresets.characterId('The id of the human.'),
    name: fieldPresets.characterName('The name of the human.'),
    friends: fieldPresets.friends(
      params.getCharacterInterface(),
      'The friends of the human, or an empty list if they have none.',
      (human) => getFriends(human),
    ),
    appearsIn: fieldPresets.appearsIn(
      params.getEpisodeEnum(),
      'Which movies they appear in.',
    ),
    homePlanet: {
      type: GraphQLString,
      description: 'The home planet of the human, or null if unknown.',
    },
    secretBackstory: {
      type: GraphQLString,
      description: 'Where are they from and how they came to be who they are.',
      resolve() {
        throw new Error('secretBackstory is secret.');
      },
    },
  };
}
