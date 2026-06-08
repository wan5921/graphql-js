import { GraphQLSchema } from '../type/schema.ts';

import {
  characterInterface,
  droidType,
  episodeEnum,
  humanType,
  queryType,
} from './starWarsSchema/schemaTypes.ts';

export { characterInterface, droidType, episodeEnum, humanType, queryType };

export const StarWarsSchema: GraphQLSchema = new GraphQLSchema({
  query: queryType,
  types: [humanType, droidType],
});
