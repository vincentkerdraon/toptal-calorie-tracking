import { ID } from './user.model';

export interface Food {
  userID: ID;
  //UTC milliseconds
  timestamp: number;
  name: string;
  calories: number;
  cheating: boolean;
}

export interface DateFilter {
  from: number;
  to: number;
}
