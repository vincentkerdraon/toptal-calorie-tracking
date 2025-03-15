import { Token, TokenEncoded } from './token.model';

export type UserRole = 'admin' | 'user';
export type UserId = string;

export interface UserSettings {
  caloryThreshold: number;
}

export interface User {
  tokenDecoded: Token;
  tokenEncoded: TokenEncoded;
  // SampleProject: in real life, this would be a different backend service. Fetch using the user token.
  settings: UserSettings;
}
