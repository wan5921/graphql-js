import type {
  GraphQLEnumType,
  GraphQLFieldConfig,
  GraphQLFieldResolver,
  GraphQLInterfaceType,
} from '../../type/definition.ts';
import { GraphQLString } from '../../type/scalars.ts';

import { idField, nameField } from '../fieldPresets/commonFields.ts';
import { buildCharacterFields } from './character.ts';

export function buildHumanFields(
  characterInterface: GraphQLInterfaceType,
  episodeEnum: GraphQLEnumType,
  getFriends: GraphQLFieldResolver<unknown, unknown>,
): Record<string, GraphQLFieldConfig<unknown, unknown>> {
  const characterFields = buildCharacterFields(characterInterface, episodeEnum);

  return {
    id: {
      ...idField,
      description: 'The id of the human.',
    },
    name: {
      ...nameField,
      description: 'The name of the human.',
    },
    friends: {
      ...characterFields.friends,
      description:
        'The friends of the human, or an empty list if they have none.',
      resolve: getFriends,
    },
    appearsIn: {
      ...characterFields.appearsIn,
      description: 'Which movies they appear in.',
    },
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