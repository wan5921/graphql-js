import type {
  GraphQLEnumType,
  GraphQLFieldConfig,
  GraphQLFieldResolver,
  GraphQLInterfaceType,
} from '../../type/definition.ts';
import { GraphQLString } from '../../type/scalars.ts';

import { idField, nameField } from '../fieldPresets/commonFields.ts';
import { buildCharacterFields } from './character.ts';

export function buildDroidFields(
  characterInterface: GraphQLInterfaceType,
  episodeEnum: GraphQLEnumType,
  getFriends: GraphQLFieldResolver<unknown, unknown>,
): Record<string, GraphQLFieldConfig<unknown, unknown>> {
  const characterFields = buildCharacterFields(characterInterface, episodeEnum);

  return {
    id: {
      ...idField,
      description: 'The id of the droid.',
    },
    name: {
      ...nameField,
      description: 'The name of the droid.',
    },
    friends: {
      ...characterFields.friends,
      description:
        'The friends of the droid, or an empty list if they have none.',
      resolve: getFriends,
    },
    appearsIn: {
      ...characterFields.appearsIn,
      description: 'Which movies they appear in.',
    },
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