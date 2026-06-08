
import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
} from '../type/definition.ts';
import { GraphQLString, GraphQLInt } from '../type/scalars.ts';
import { GraphQLSchema } from '../type/schema.ts';

import {
  addUser,
  addPost,
  getUser,
  getPosts,
} from './testData.ts';

const userType = new GraphQLObjectType({
  name: 'User',
  description: 'A user in our system.',
  fields: () =&gt; ({
    id: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The id of the user.',
    },
    name: {
      type: GraphQLString,
      description: 'The name of the user.',
    },
  }),
});

const postType = new GraphQLObjectType({
  name: 'Post',
  description: 'A post in our system.',
  fields: () =&gt; ({
    id: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The id of the post.',
    },
    title: {
      type: GraphQLString,
      description: 'The title of the post.',
    },
    userId: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The user id who created the post.',
    },
  }),
});

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () =&gt; ({
    user: {
      type: userType,
      args: {
        id: {
          description: 'id of the user',
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
      resolve: (_source, { id }) =&gt; getUser(id),
    },
    posts: {
      type: new GraphQLList(postType),
      description: 'Get all posts',
      resolve: () =&gt; getPosts(),
    },
  }),
});

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () =&gt; ({
    addUser: {
      type: userType,
      args: {
        name: {
          description: 'Name of the user',
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: (_source, { name }) =&gt; addUser(name),
    },
    addPost: {
      type: postType,
      args: {
        title: {
          description: 'Title of the post',
          type: new GraphQLNonNull(GraphQLString),
        },
        userId: {
          description: 'User id of the post author',
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
      resolve: (_source, { title, userId }) =&gt; addPost(title, userId),
    },
  }),
});

export const TestSchema: GraphQLSchema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
  types: [userType, postType],
});

