import { UserId, UserRole } from './user.model';

export type TokenEncoded = string;

//SampleProject: assuming the token is a JWT token containing some data
export interface Token {
  id: UserId;
  name: string;
  role: UserRole;
}
