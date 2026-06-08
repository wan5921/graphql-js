import { GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLList } from '../../type/index.ts';
import { timestampFields, paginationArgs } from '../fieldPresets.ts';
import { PostType } from './Post.ts';

export const UserType: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  description: 'A user of the application',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The id of the user',
    },
    username: {
      type: GraphQLString,
      description: 'The username of the user',
    },
    posts: {
      type: new GraphQLList(PostType),
      description: 'Posts written by the user',
      args: paginationArgs,
      resolve: (user: any, args: any) => {
        const allPosts = user.posts || [];
        return allPosts.slice(args.offset, args.offset + args.limit);
      },
    },
    ...timestampFields,
  }),
});
