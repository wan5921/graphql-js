import {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from '../index.ts';

import { addPost, addUser, getPosts, getUser } from './userPostData.ts';

const userType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    name: {
      type: GraphQLString,
    },
  }),
});

const postType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    title: {
      type: GraphQLString,
    },
  }),
});

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    user: {
      type: userType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
      resolve: (_source, { id }) => getUser(id),
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(postType))),
      resolve: () => getPosts(),
    },
  }),
});

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    addUser: {
      type: userType,
      args: {
        name: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: (_source, { name }) => addUser(name),
    },
    addPost: {
      type: postType,
      args: {
        title: {
          type: new GraphQLNonNull(GraphQLString),
        },
        userId: {
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
      resolve: (_source, { title, userId }) => addPost(title, userId),
    },
  }),
});

export const UserPostSchema: GraphQLSchema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
  types: [userType, postType],
});
