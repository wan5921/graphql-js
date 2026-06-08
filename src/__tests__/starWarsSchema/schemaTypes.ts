import {
  GraphQLEnumType,
  GraphQLInterfaceType,
  GraphQLObjectType,
} from '../../type/definition.ts';

import type { Droid, Human } from '../starWarsData.ts';

import { createCharacterFields } from './types/characterFields.ts';
import { createDroidFields } from './types/droidFields.ts';
import { createHumanFields } from './types/humanFields.ts';
import { createQueryFields } from './types/queryFields.ts';

export const episodeEnum: GraphQLEnumType = new GraphQLEnumType({
  name: 'Episode',
  description: 'One of the films in the Star Wars Trilogy',
  values: {
    NEW_HOPE: {
      value: 4,
      description: 'Released in 1977.',
    },
    EMPIRE: {
      value: 5,
      description: 'Released in 1980.',
    },
    JEDI: {
      value: 6,
      description: 'Released in 1983.',
    },
  },
});

export const characterInterface: GraphQLInterfaceType<Human | Droid> =
  new GraphQLInterfaceType({
    name: 'Character',
    description: 'A character in the Star Wars Trilogy',
    fields: () =>
      createCharacterFields({
        getEpisodeEnum: () => episodeEnum,
        getCharacterInterface: () => characterInterface,
      }),
    resolveType(character) {
      switch (character.type) {
        case 'Human':
          return humanType.name;
        case 'Droid':
          return droidType.name;
      }
    },
  });

export const humanType: GraphQLObjectType<Human> = new GraphQLObjectType({
  name: 'Human',
  description: 'A humanoid creature in the Star Wars universe.',
  fields: () =>
    createHumanFields({
      getEpisodeEnum: () => episodeEnum,
      getCharacterInterface: () => characterInterface,
    }),
  interfaces: [characterInterface],
});

export const droidType: GraphQLObjectType<Droid> = new GraphQLObjectType({
  name: 'Droid',
  description: 'A mechanical creature in the Star Wars universe.',
  fields: () =>
    createDroidFields({
      getEpisodeEnum: () => episodeEnum,
      getCharacterInterface: () => characterInterface,
    }),
  interfaces: [characterInterface],
});

export const queryType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Query',
  fields: () =>
    createQueryFields({
      getEpisodeEnum: () => episodeEnum,
      getCharacterInterface: () => characterInterface,
      getHumanType: () => humanType,
      getDroidType: () => droidType,
    }),
});
