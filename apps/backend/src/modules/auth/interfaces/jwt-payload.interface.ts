export interface JwtPayload {
  sub: string;
  provider: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  userId: string;
  provider: string;
}
