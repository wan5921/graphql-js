import type { GraphQLFieldConfigMap, GraphQLInterfaceType } from '../type/definition.ts';
import { GraphQLList } from '../type/definition.ts';
import { GraphQLString } from '../type/scalars.ts';
import { idField, nameField, mergeFields } from '../type/fieldPresets.ts';

import { episodeEnum } from './episodeEnum.ts';
import type { Human } from '../__tests__/starWarsData.ts';
import { getFriends } from '../__tests__/starWarsData.ts';

export function getHumanFields(
  characterInterface: GraphQLInterfaceType,
): GraphQLFieldConfigMap<Human, any> {
  return mergeFields<Human, any>(
    {
      id: idField<Human, any>('The id of the human.'),
      name: nameField<Human, any>('The name of the human.'),
      friends: {
        type: new GraphQLList(characterInterface),
        description:
          'The friends of the human, or an empty list if they have none.',
        resolve: (human) => getFriends(human),
      },
      appearsIn: {
        type: new GraphQLList(episodeEnum),
        description: 'Which movies they appear in.',
      },
      secretBackstory: {
        type: GraphQLString,
        description:
          'Where are they from and how they came to be who they are.',
        resolve() {
          throw new Error('secretBackstory is secret.');
        },
      },
    },
    {
      homePlanet: {
        type: GraphQLString,
        description: 'The home planet of the human, or null if unknown.',
      },
    },
  );
}
