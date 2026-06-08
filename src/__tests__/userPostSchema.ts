import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
} from '../type/definition.ts';
import { GraphQLInt, GraphQLString } from '../type/scalars.ts';
import { GraphQLSchema } from '../type/schema.ts';

import {
  addPost,
  addUser,
  getAllPosts,
  getUser,
} from './userPostData.ts';

const userType: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  description: 'A user in the system.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The id of the user.',
    },
    name: {
      type: GraphQLString,
      description: 'The name of the user.',
    },
    posts: {
      type: new GraphQLList(postType),
      description: 'The posts written by the user.',
      resolve: (user) =>
        getAllPosts().filter((post) => post.userId === user.id),
    },
  }),
});

const postType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Post',
  description: 'A post written by a user.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The id of the post.',
    },
    title: {
      type: GraphQLString,
      description: 'The title of the post.',
    },
    author: {
      type: userType,
      description: 'The author of the post.',
      resolve: (post) => getUser(post.userId),
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
          description: 'id of the user',
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
      resolve: (_source, { id }) => getUser(id),
    },
    posts: {
      type: new GraphQLList(postType),
      resolve: () => getAllPosts(),
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
          description: 'name of the new user',
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: (_source, { name }) => addUser(name),
    },
    addPost: {
      type: postType,
      args: {
        title: {
          description: 'title of the new post',
          type: new GraphQLNonNull(GraphQLString),
        },
        userId: {
          description: 'id of the author',
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
