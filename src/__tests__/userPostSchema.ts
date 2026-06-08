import {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
} from '../type/definition.ts';
import { GraphQLID, GraphQLString } from '../type/scalars.ts';
import { GraphQLSchema } from '../type/schema.ts';

interface UserRecord {
  id: string;
  name: string;
  email: string;
}

interface PostRecord {
  id: string;
  userId: string;
  title: string;
  content: string;
}

const initialUsers: ReadonlyArray<UserRecord> = [
  { id: '1', name: 'Ada Lovelace', email: 'ada@example.com' },
  { id: '2', name: 'Grace Hopper', email: 'grace@example.com' },
];

const initialPosts: ReadonlyArray<PostRecord> = [
  {
    id: '1',
    userId: '1',
    title: 'GraphQL Basics',
    content: 'Introduction to queries and mutations.',
  },
  {
    id: '2',
    userId: '2',
    title: 'Schema Design',
    content: 'Designing expressive GraphQL schemas.',
  },
];

let users = cloneUsers(initialUsers);
let posts = clonePosts(initialPosts);
let nextUserId = 3;
let nextPostId = 3;

function cloneUsers(source: ReadonlyArray<UserRecord>): Array<UserRecord> {
  return source.map((user) => ({ ...user }));
}

function clonePosts(source: ReadonlyArray<PostRecord>): Array<PostRecord> {
  return source.map((post) => ({ ...post }));
}

export function resetUserPostStore(): void {
  users = cloneUsers(initialUsers);
  posts = clonePosts(initialPosts);
  nextUserId = 3;
  nextPostId = 3;
}

function getUserById(id: string): UserRecord | undefined {
  return users.find((user) => user.id === id);
}

function getPostById(id: string): PostRecord | undefined {
  return posts.find((post) => post.id === id);
}

function getRequiredUser(id: string): UserRecord {
  const user = getUserById(id);
  if (user === undefined) {
    throw new Error(`User with id "${id}" does not exist.`);
  }
  return user;
}

function getRequiredPost(id: string): PostRecord {
  const post = getPostById(id);
  if (post === undefined) {
    throw new Error(`Post with id "${id}" does not exist.`);
  }
  return post;
}

const createUserInputType = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
  },
});

const updateUserInputType = new GraphQLInputObjectType({
  name: 'UpdateUserInput',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
  },
});

const createPostInputType = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    userId: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
  },
});

const updatePostInputType = new GraphQLInputObjectType({
  name: 'UpdatePostInput',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  },
});

const userType: GraphQLObjectType<UserRecord> = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    posts: {
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(postType)),
      ),
      resolve: (user) => posts.filter((post) => post.userId === user.id),
    },
  }),
});

const postType: GraphQLObjectType<PostRecord> = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    author: {
      type: new GraphQLNonNull(userType),
      resolve: (post) => getRequiredUser(post.userId),
    },
  }),
});

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    user: {
      type: userType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: (_source, { id }) => getUserById(id),
    },
    post: {
      type: postType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: (_source, { id }) => getPostById(id),
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(postType))),
      resolve: () => posts,
    },
  },
});

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: new GraphQLNonNull(userType),
      args: {
        input: { type: new GraphQLNonNull(createUserInputType) },
      },
      resolve: (_source, { input }) => {
        const user = {
          id: String(nextUserId++),
          name: input.name,
          email: input.email,
        };
        users.push(user);
        return user;
      },
    },
    updateUser: {
      type: new GraphQLNonNull(userType),
      args: {
        input: { type: new GraphQLNonNull(updateUserInputType) },
      },
      resolve: (_source, { input }) => {
        const user = getRequiredUser(input.id);
        if (input.name != null) {
          user.name = input.name;
        }
        if (input.email != null) {
          user.email = input.email;
        }
        return user;
      },
    },
    deleteUser: {
      type: new GraphQLNonNull(userType),
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: (_source, { id }) => {
        const user = getRequiredUser(id);
        users = users.filter((item) => item.id !== id);
        posts = posts.filter((post) => post.userId !== id);
        return user;
      },
    },
    addPost: {
      type: new GraphQLNonNull(postType),
      args: {
        input: { type: new GraphQLNonNull(createPostInputType) },
      },
      resolve: (_source, { input }) => {
        getRequiredUser(input.userId);
        const post = {
          id: String(nextPostId++),
          userId: input.userId,
          title: input.title,
          content: input.content,
        };
        posts.push(post);
        return post;
      },
    },
    updatePost: {
      type: new GraphQLNonNull(postType),
      args: {
        input: { type: new GraphQLNonNull(updatePostInputType) },
      },
      resolve: (_source, { input }) => {
        const post = getRequiredPost(input.id);
        if (input.title != null) {
          post.title = input.title;
        }
        if (input.content != null) {
          post.content = input.content;
        }
        return post;
      },
    },
    deletePost: {
      type: new GraphQLNonNull(postType),
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: (_source, { id }) => {
        const post = getRequiredPost(id);
        posts = posts.filter((item) => item.id !== id);
        return post;
      },
    },
  },
});

export const userPostSchema: GraphQLSchema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
});
