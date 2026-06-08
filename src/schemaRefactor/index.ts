import { GraphQLSchema, GraphQLObjectType, GraphQLList } from '../type/index.ts';
import { UserType } from './types/User.ts';
import { PostType } from './types/Post.ts';
import { paginationArgs } from './fieldPresets.ts';

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    users: {
      type: new GraphQLList(UserType),
      args: paginationArgs,
      resolve: (_source: any, args: any, context: any) => {
        const allUsers = context.users || [];
        return allUsers.slice(args.offset, args.offset + args.limit);
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      args: paginationArgs,
      resolve: (_source: any, args: any, context: any) => {
        const allPosts = context.posts || [];
        return allPosts.slice(args.offset, args.offset + args.limit);
      },
    },
  },
});

export const schema: GraphQLSchema = new GraphQLSchema({
  query: QueryType,
});
