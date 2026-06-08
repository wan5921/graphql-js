import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
} from '../type/definition.ts';
import { GraphQLInt, GraphQLString } from '../type/scalars.ts';
import { GraphQLSchema } from '../type/schema.ts';

// ==========================================
// 数据层 (Data Layer)
// 参考 starWarsData.ts 风格，并使用 Map 存储
// ==========================================

export interface User {
  id: number;
  name: string;
}

export interface Post {
  id: number;
  title: string;
  userId: number;
}

const userData = new Map<number, User>();
const postData = new Map<number, Post>();

let nextUserId = 1;
let nextPostId = 1;

/**
 * 获取指定 ID 的用户
 */
export function getUser(id: number): User | undefined {
  return userData.get(id);
}

/**
 * 获取所有帖子
 */
export function getPosts(): Post[] {
  return Array.from(postData.values());
}

/**
 * 添加新用户并自动生成 ID
 */
export function addUser(name: string): User {
  const user: User = { id: nextUserId++, name };
  userData.set(user.id, user);
  return user;
}

/**
 * 添加新帖子并自动生成 ID
 */
export function addPost(title: string, userId: number): Post {
  const post: Post = { id: nextPostId++, title, userId };
  postData.set(post.id, post);
  return post;
}

// ==========================================
// Schema 层 (Schema Layer)
// 参考 starWarsSchema.ts 风格
// ==========================================

/**
 * User 类型定义
 */
const userType = new GraphQLObjectType({
  name: 'User',
  description: 'A user of the blog.',
  fields: () => ({
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

/**
 * Post 类型定义
 */
const postType = new GraphQLObjectType({
  name: 'Post',
  description: 'A post in the blog.',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The id of the post.',
    },
    title: {
      type: GraphQLString,
      description: 'The title of the post.',
    },
    // 可选：将关联的 userId 也暴露在 GraphQL 中
    userId: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The id of the author.',
    },
  }),
});

/**
 * Query 根节点定义
 */
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
      description: 'Get all posts',
      resolve: () => getPosts(),
    },
  }),
});

/**
 * Mutation 根节点定义
 */
const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    addUser: {
      type: userType,
      args: {
        name: {
          description: 'name of the user',
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: (_source, { name }) => addUser(name),
    },
    addPost: {
      type: postType,
      args: {
        title: {
          description: 'title of the post',
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

/**
 * 组装并导出 Schema
 */
export const BlogSchema: GraphQLSchema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
  types: [userType, postType],
});
