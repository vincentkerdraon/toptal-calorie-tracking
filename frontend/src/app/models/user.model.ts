import { Token, TokenEncoded } from './token.model';

export type UserRole = 'admin' | 'user';
export type UserId = string;

export interface User {
  id: UserId;
  token: Token;
  tokenEncoded: TokenEncoded;
}
