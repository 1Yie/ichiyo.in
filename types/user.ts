export interface Me {
  authenticated: boolean;
  user: {
    id: string;
    email: string;
    uid: number;
    isAdmin: boolean;
  };
}

export interface Users {
  uid: number;
  id: string;
  email: string;
}

export interface UsersResponse {
  users: {
    uid: number;
    id: string;
    email: string;
  }[];
}
