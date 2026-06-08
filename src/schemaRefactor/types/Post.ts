import { GraphQLObjectType, GraphQLString, GraphQLNonNull } from '../../type/index.ts';
import { timestampFields } from '../fieldPresets.ts';
import { UserType } from './User.ts';

export const PostType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Post',
  description: 'A post written by a user',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the post',
    },
    title: {
      type: GraphQLString,
      description: 'The title of the post',
    },
    content: {
      type: GraphQLString,
      description: 'The content of the post',
    },
    author: {
      type: UserType,
      description: 'The author of the post',
      resolve: (post: any) => post.author,
    },
    ...timestampFields,
  }),
});
