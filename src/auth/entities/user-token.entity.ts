export interface UserTokenEntity {
  user: AuthenticatedUser;
}

export interface AuthenticatedUser {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}
