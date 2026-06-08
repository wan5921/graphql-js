import type { GraphQLFieldConfigMap, GraphQLInterfaceType } from '../type/definition.ts';
import { GraphQLList } from '../type/definition.ts';
import { GraphQLString } from '../type/scalars.ts';
import { idField, nameField, mergeFields } from '../type/fieldPresets.ts';

import { episodeEnum } from './episodeEnum.ts';
import type { Droid } from '../__tests__/starWarsData.ts';
import { getFriends } from '../__tests__/starWarsData.ts';

export function getDroidFields(
  characterInterface: GraphQLInterfaceType,
): GraphQLFieldConfigMap<Droid, any> {
  return mergeFields<Droid, any>(
    {
      id: idField<Droid, any>('The id of the droid.'),
      name: nameField<Droid, any>('The name of the droid.'),
      friends: {
        type: new GraphQLList(characterInterface),
        description:
          'The friends of the droid, or an empty list if they have none.',
        resolve: (droid) => getFriends(droid),
      },
      appearsIn: {
        type: new GraphQLList(episodeEnum),
        description: 'Which movies they appear in.',
      },
      secretBackstory: {
        type: GraphQLString,
        description: 'Construction date and the name of the designer.',
        resolve() {
          throw new Error('secretBackstory is secret.');
        },
      },
    },
    {
      primaryFunction: {
        type: GraphQLString,
        description: 'The primary function of the droid.',
      },
    },
  );
}
