import { Token, TokenEncoded } from './token.model';

export type UserRole = 'admin' | 'user';
export type ID = string;

export interface User {
  id: ID;
  token: Token;
  tokenEncoded: TokenEncoded;
}
