import { UserId } from './user.model';

export type FoodId = string;

export interface Food {
  id: FoodId;
  userId: UserId;
  /** UTC milliseconds */
  timestamp: number;
  name: string;
  calories: number;
  cheating: boolean;
}

export function validateFood(food: Food): void {
  if (food.name.length === 0) {
    throw new Error('Food name must not be empty');
  }
  if (food.calories <= 0) {
    throw new Error('Calories must be greater than 0');
  }
  if (food.timestamp <= 0) {
    throw new Error('Timestamp must be a positive number');
  }
  if (food.userId.length === 0) {
    throw new Error('User ID must not be empty');
  }
  if (typeof food.cheating !== 'boolean') {
    throw new Error('Cheating must be a boolean');
  }
}

export interface DateFilter {
  from: number;
  to: number;
}
