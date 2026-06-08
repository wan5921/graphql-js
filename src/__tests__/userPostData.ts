export interface User {
  id: number;
  name: string;
}

interface PostRecord {
  id: number;
  title: string;
  userId: number;
}

const initialUsers: Array<User> = [{ id: 1, name: 'Ada' }];
const initialPosts: Array<PostRecord> = [
  { id: 1, title: 'Hello GraphQL', userId: 1 },
];

const userData = new Map<number, User>();
const postData = new Map<number, PostRecord>();

let nextUserId = 1;
let nextPostId = 1;

export function resetUserPostData(): void {
  userData.clear();
  postData.clear();

  for (const user of initialUsers) {
    userData.set(user.id, user);
  }

  for (const post of initialPosts) {
    postData.set(post.id, post);
  }

  nextUserId = initialUsers.length + 1;
  nextPostId = initialPosts.length + 1;
}

resetUserPostData();

export function getUser(id: number): User | null {
  return userData.get(id) ?? null;
}

export function getPosts(): Array<PostRecord> {
  return Array.from(postData.values());
}

export function addUser(name: string): User {
  const user = {
    id: nextUserId++,
    name,
  };

  userData.set(user.id, user);

  return user;
}

export function addPost(title: string, userId: number): PostRecord | null {
  if (!userData.has(userId)) {
    return null;
  }

  const post = {
    id: nextPostId++,
    title,
    userId,
  };

  postData.set(post.id, post);

  return post;
}
