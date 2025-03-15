import { UserId } from './user.model';

export type FoodId = string;

export interface Food {
  id: FoodId;
  userId: UserId;
  //UTC milliseconds
  timestamp: number;
  name: string;
  calories: number;
  cheating: boolean;
}

export function validateFood(food: Food): boolean {
  return (
    food.name.length > 0 &&
    food.calories > 0 &&
    food.timestamp > 0 &&
    food.userId.length > 0 &&
    typeof food.cheating === 'boolean'
  );
}

export interface DateFilter {
  from: number;
  to: number;
}
