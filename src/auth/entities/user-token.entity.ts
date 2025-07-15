export interface UserTokenEntity {
  user: AuthenticatedUserEntity;
}

export interface AuthenticatedUserEntity {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}
