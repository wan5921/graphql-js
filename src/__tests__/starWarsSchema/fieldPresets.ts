import type {
  GraphQLArgumentConfig,
  GraphQLEnumType,
  GraphQLFieldConfig,
  GraphQLInterfaceType,
} from '../../type/definition.ts';
import { GraphQLList, GraphQLNonNull } from '../../type/definition.ts';
import { GraphQLString } from '../../type/scalars.ts';

import type { Character } from '../starWarsData.ts';

export const fieldPresets = {
  characterId(description: string): GraphQLFieldConfig<Character, unknown> {
    return {
      type: new GraphQLNonNull(GraphQLString),
      description,
    };
  },

  characterName(description: string): GraphQLFieldConfig<Character, unknown> {
    return {
      type: GraphQLString,
      description,
    };
  },

  appearsIn(
    episodeEnum: GraphQLEnumType,
    description: string,
  ): GraphQLFieldConfig<Character, unknown> {
    return {
      type: new GraphQLList(episodeEnum),
      description,
    };
  },

  friends<TSource extends Character>(
    characterInterface: GraphQLInterfaceType,
    description: string,
    resolve?: GraphQLFieldConfig<TSource, unknown>['resolve'],
  ): GraphQLFieldConfig<TSource, unknown> {
    return {
      type: new GraphQLList(characterInterface),
      description,
      resolve,
    };
  },

  entityIdArg(description: string): GraphQLArgumentConfig {
    return {
      description,
      type: new GraphQLNonNull(GraphQLString),
    };
  },

  episodeArg(
    episodeEnum: GraphQLEnumType,
    description: string,
  ): GraphQLArgumentConfig {
    return {
      description,
      type: episodeEnum,
    };
  },
};
