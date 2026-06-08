import {
  GraphQLInterfaceType,
  GraphQLObjectType,
} from '../type/definition.ts';
import { GraphQLSchema } from '../type/schema.ts';

import { getCharacterInterfaceFields } from './characterFields.ts';
import { getHumanFields } from './humanFields.ts';
import { getDroidFields } from './droidFields.ts';
import { getQueryFields } from './queryFields.ts';

export { episodeEnum } from './episodeEnum.ts';
export { getCharacterInterfaceFields } from './characterFields.ts';
export { getHumanFields } from './humanFields.ts';
export { getDroidFields } from './droidFields.ts';
export { getQueryFields } from './queryFields.ts';

export const characterInterface: GraphQLInterfaceType =
  new GraphQLInterfaceType({
    name: 'Character',
    description: 'A character in the Star Wars Trilogy',
    fields: () => getCharacterInterfaceFields(characterInterface),
    resolveType(character: { type: string }) {
      switch (character.type) {
        case 'Human':
          return humanType.name;
        case 'Droid':
          return droidType.name;
      }
    },
  });

export const humanType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Human',
  description: 'A humanoid creature in the Star Wars universe.',
  fields: () => getHumanFields(characterInterface),
  interfaces: [characterInterface],
});

export const droidType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Droid',
  description: 'A mechanical creature in the Star Wars universe.',
  fields: () => getDroidFields(characterInterface),
  interfaces: [characterInterface],
});

export const queryType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Query',
  fields: () => getQueryFields(characterInterface, humanType, droidType),
});

export const StarWarsSchema: GraphQLSchema = new GraphQLSchema({
  query: queryType,
  types: [humanType, droidType],
});
