
export interface User {
  id: number;
  name: string;
}

export interface Post {
  id: number;
  title: string;
  userId: number;
}

const userData: Map&lt;number, User&gt; = new Map();
const postData: Map&lt;number, Post&gt; = new Map();

let nextUserId = 1;
let nextPostId = 1;

export function addUser(name: string): User {
  const user: User = {
    id: nextUserId++,
    name,
  };
  userData.set(user.id, user);
  return user;
}

export function addPost(title: string, userId: number): Post {
  const post: Post = {
    id: nextPostId++,
    title,
    userId,
  };
  postData.set(post.id, post);
  return post;
}

export function getUser(id: number): User | undefined {
  return userData.get(id);
}

export function getPosts(): Post[] {
  return Array.from(postData.values());
}

