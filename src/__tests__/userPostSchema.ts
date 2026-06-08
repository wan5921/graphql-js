import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
} from '../type/definition.ts';
import { GraphQLID, GraphQLString } from '../type/scalars.ts';
import { GraphQLSchema } from '../type/schema.ts';

interface UserData {
  id: string;
  name: string;
  email: string | null;
}

interface PostData {
  id: string;
  title: string;
  content: string | null;
  authorId: string;
}

const users: Map<string, UserData> = new Map();
const posts: Map<string, PostData> = new Map();

let nextUserId = 1;
let nextPostId = 1;

function addUserData(name: string, email: string | null): UserData {
  const id = String(nextUserId++);
  const user: UserData = { id, name, email };
  users.set(id, user);
  return user;
}

function addPostData(
  title: string,
  content: string | null,
  authorId: string,
): PostData | null {
  if (!users.has(authorId)) {
    return null;
  }
  const id = String(nextPostId++);
  const post: PostData = { id, title, content, authorId };
  posts.set(id, post);
  return post;
}

function getUserData(id: string): UserData | null {
  return users.get(id) ?? null;
}

function getUserPostsData(userId: string): Array<PostData> {
  const result: Array<PostData> = [];
  for (const post of posts.values()) {
    if (post.authorId === userId) {
      result.push(post);
    }
  }
  return result;
}

function getAllPostsData(): Array<PostData> {
  return Array.from(posts.values());
}

export function resetUserPostData(): void {
  users.clear();
  posts.clear();
  nextUserId = 1;
  nextPostId = 1;
}

const userType: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  description: 'A user of the blog.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the user.',
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the user.',
    },
    email: {
      type: GraphQLString,
      description: 'The email of the user.',
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(postType))),
      description: 'The posts written by this user.',
      resolve: (user) => getUserPostsData(user.id),
    },
  }),
});

const postType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Post',
  description: 'A blog post.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the post.',
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The title of the post.',
    },
    content: {
      type: GraphQLString,
      description: 'The content of the post.',
    },
    author: {
      type: new GraphQLNonNull(userType),
      description: 'The author of the post.',
      resolve: (post) => getUserData(post.authorId),
    },
  }),
});

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: new GraphQLNonNull(userType),
      description: 'Add a new user.',
      args: {
        name: {
          type: new GraphQLNonNull(GraphQLString),
          description: 'The name of the user.',
        },
        email: {
          type: GraphQLString,
          description: 'The email of the user.',
        },
      },
      resolve: (_source, { name, email }) => addUserData(name, email ?? null),
    },
    addPost: {
      type: postType,
      description: 'Add a new post.',
      args: {
        title: {
          type: new GraphQLNonNull(GraphQLString),
          description: 'The title of the post.',
        },
        content: {
          type: GraphQLString,
          description: 'The content of the post.',
        },
        authorId: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'The id of the author.',
        },
      },
      resolve: (_source, { title, content, authorId }) =>
        addPostData(title, content ?? null, authorId),
    },
  },
});

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    user: {
      type: userType,
      description: 'Get a user by id.',
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'The id of the user.',
        },
      },
      resolve: (_source, { id }) => getUserData(id),
    },
    posts: {
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(postType)),
      ),
      description: 'Get all posts.',
      resolve: () => getAllPostsData(),
    },
  },
});

export const UserPostSchema: GraphQLSchema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
  types: [userType, postType],
});