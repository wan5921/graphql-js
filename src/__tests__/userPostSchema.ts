import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
} from '../index.js';

type User = {
  id: string;
  name: string;
};

type Post = {
  id: string;
  title: string;
  authorId: string;
};

export const users: User[] = [];
export const posts: Post[] = [];

let userIdCounter = 1;
let postIdCounter = 1;

export const resetData = (): void => {
  users.length = 0;
  posts.length = 0;
  userIdCounter = 1;
  postIdCounter = 1;
};

const PostType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(GraphQLID) },
    author: {
      type: UserType,
      resolve: (post) => users.find((user) => user.id === post.authorId),
    },
  }),
});

const UserType: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    posts: {
      type: new GraphQLList(PostType),
      resolve: (user) => posts.filter((post) => post.authorId === user.id),
    },
  }),
});

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    user: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: (_, { id }) => users.find((user) => user.id === id) || null,
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: () => posts,
    },
  },
});

const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: UserType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (_, { name }) => {
        const user = { id: String(userIdCounter++), name };
        users.push(user);
        return user;
      },
    },
    updateUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (_, { id, name }) => {
        const user = users.find((u) => u.id === id);
        if (!user) {
          throw new Error(`User with id ${id} does not exist`);
        }
        user.name = name;
        return user;
      },
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: (_, { id }) => {
        const index = users.findIndex((u) => u.id === id);
        if (index === -1) {
          throw new Error(`User with id ${id} does not exist`);
        }
        const user = users[index];
        users.splice(index, 1);
        // Cascade delete posts
        for (let i = posts.length - 1; i >= 0; i--) {
          if (posts[i].authorId === id) {
            posts.splice(i, 1);
          }
        }
        return user;
      },
    },
    addPost: {
      type: PostType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: (_, { title, authorId }) => {
        if (!users.find((u) => u.id === authorId)) {
          throw new Error(`User with id ${authorId} does not exist`);
        }
        const post = { id: String(postIdCounter++), title, authorId };
        posts.push(post);
        return post;
      },
    },
    updatePost: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        title: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (_, { id, title }) => {
        const post = posts.find((p) => p.id === id);
        if (!post) {
          throw new Error(`Post with id ${id} does not exist`);
        }
        post.title = title;
        return post;
      },
    },
    deletePost: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: (_, { id }) => {
        const index = posts.findIndex((p) => p.id === id);
        if (index === -1) {
          throw new Error(`Post with id ${id} does not exist`);
        }
        const post = posts[index];
        posts.splice(index, 1);
        return post;
      },
    },
  },
});

export const userPostSchema: GraphQLSchema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
});
