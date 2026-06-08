import { createTypeConfig } from '../typeConfig';
import { idPreset, mergeFieldConfigs, timestampPreset } from '../fieldPresets';

import { GraphQLString } from '../../type/scalars';
import { GraphQLNonNull } from '../../type/definition';

export const userTypeConfig = createTypeConfig('User', {
  name: 'User',
  fields: mergeFieldConfigs(
    idPreset(),
    timestampPreset(),
    {
      name: {
        type: new GraphQLNonNull(GraphQLString),
      },
      email: {
        type: new GraphQLNonNull(GraphQLString),
      },
      avatar: {
        type: GraphQLString,
      },
    },
  ),
});
