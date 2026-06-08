import type {
  GraphQLEnumType,
  GraphQLFieldConfig,
  GraphQLInterfaceType,
} from '../../type/definition.ts';
import { GraphQLList } from '../../type/definition.ts';
import { GraphQLString } from '../../type/scalars.ts';

import { idField, nameField } from '../fieldPresets/commonFields.ts';

export function buildCharacterFields(
  characterInterface: GraphQLInterfaceType,
  episodeEnum: GraphQLEnumType,
): Record<string, GraphQLFieldConfig<unknown, unknown>> {
  return {
    id: {
      ...idField,
      description: 'The id of the character.',
    },
    name: {
      ...nameField,
      description: 'The name of the character.',
    },
    friends: {
      type: new GraphQLList(characterInterface),
      description:
        'The friends of the character, or an empty list if they have none.',
    },
    appearsIn: {
      type: new GraphQLList(episodeEnum),
      description: 'Which movies they appear in.',
    },
    secretBackstory: {
      type: GraphQLString,
      description: 'All secrets about their past.',
    },
  };
}