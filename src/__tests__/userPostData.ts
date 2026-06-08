export interface User {
  id: number;
  name: string;
}

export interface Post {
  id: number;
  title: string;
  userId: number;
}

const userData: Map<number, User> = new Map();
const postData: Map<number, Post> = new Map();

let nextUserId = 1;
let nextPostId = 1;

export function getUser(id: number): User | undefined {
  return userData.get(id);
}

export function getAllPosts(): Array<Post> {
  return Array.from(postData.values());
}

export function addUser(name: string): User {
  const id = nextUserId++;
  const user: User = { id, name };
  userData.set(id, user);
  return user;
}

export function addPost(title: string, userId: number): Post | null {
  if (!userData.has(userId)) {
    return null;
  }
  const id = nextPostId++;
  const post: Post = { id, title, userId };
  postData.set(id, post);
  return post;
}
