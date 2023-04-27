export interface IDecodedJWT {
  username: string;
  role: 'user' | 'admin';
  org: string;
}

export interface IUserData {
  username: string;
  role: 'user' | 'admin';
  org: string;
}
