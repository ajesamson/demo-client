export interface UserTokenEntity {
  user: AuthenticatedUser;
}

interface AuthenticatedUser {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}
