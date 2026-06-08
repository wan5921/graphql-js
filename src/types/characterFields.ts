import type { GraphQLFieldConfigMap, GraphQLInterfaceType } from '../type/definition.ts';
import { GraphQLList } from '../type/definition.ts';
import { GraphQLString } from '../type/scalars.ts';
import { idField, nameField } from '../type/fieldPresets.ts';

import { episodeEnum } from './episodeEnum.ts';

export function getCharacterInterfaceFields(
  characterInterface: GraphQLInterfaceType,
): GraphQLFieldConfigMap<any, any> {
  return {
    id: idField<any, any>('The id of the character.'),
    name: nameField<any, any>('The name of the character.'),
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
