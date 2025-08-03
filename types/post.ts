import type { User } from "@/types/auth";

export interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  tags: {
    id: number;
    name: string;
  }[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
  authors: {
    uid: number;
    id: string;
    email: string;
  }[];
}


export interface PostT {
  id: number;
  title: string;
  content: string;
  published: boolean;
  slug?: string;
  tags: { name: string }[];
  authors: { user: User }[];
}

export interface PostData {
  post: PostT;
  me: User;
  users: User[];
}

export interface CurrentUser {
  uid: number;
  email: string;
  isAdmin: boolean;
}