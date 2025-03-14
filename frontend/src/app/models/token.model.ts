import { ID, UserRole } from './user.model';

export type TokenEncoded = string;

//SampleProject: assuming the token is a JWT token containing some data
export interface Token {
  id: ID;
  name: string;
  role: UserRole;
}
