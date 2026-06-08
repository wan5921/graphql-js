import { createTypeConfig } from '../typeConfig';
import { idPreset, mergeFieldConfigs, timestampPreset } from '../fieldPresets';

import { GraphQLFloat, GraphQLString } from '../../type/scalars';
import { GraphQLNonNull } from '../../type/definition';

export const productTypeConfig = createTypeConfig('Product', {
  name: 'Product',
  fields: mergeFieldConfigs(
    idPreset(),
    timestampPreset(),
    {
      name: {
        type: new GraphQLNonNull(GraphQLString),
      },
      description: {
        type: GraphQLString,
      },
      price: {
        type: new GraphQLNonNull(GraphQLFloat),
      },
      sku: {
        type: new GraphQLNonNull(GraphQLString),
      },
    },
  ),
});
