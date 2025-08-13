import type { User } from "@/types/auth";

export interface Tag {
  id: number;
  name: string;
}

export interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  tags: Tag[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
  authors: User[];
}

export interface PostBySlug {
  id: number;
  slug: string;
  title: string;
  content: string;
  tags: Tag[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
  authors: User[];
}

export interface PostById {
  id: number;
  title: string;
  content: string;
  published: boolean;
  slug?: string;
  tags: { name: string }[];
  authors: User[];
}

export interface PostData {
  post: PostById;
  me: User;
  users: User[];
}

export interface CurrentUser {
  uid: number;
  email: string;
  isAdmin: boolean;
}
