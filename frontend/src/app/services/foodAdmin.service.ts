import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Food, validateFood } from '../models/food.model';
import { UserId } from '../models/user.model';
import { UserService } from './user.service';

interface AdminData {
  userId: UserId;
  food: Food[];
}

@Injectable({
  providedIn: 'root',
})
export class FoodAdminService {
  private adminData?: AdminData;
  private foodSubject = new BehaviorSubject<Food[]>([]);
  private useMock = true; // Flag to switch between server-side and mock implementations

  constructor(private http: HttpClient, private userService: UserService) {}

  public loadAdminData() {
    const user = this.userService.getCurrentUser();
    if (!user) {
      this.adminData = undefined;
      throw new Error('User not found');
    }
    if (user.tokenDecoded.role !== 'admin') {
      this.adminData = undefined;
      throw new Error('User is not an admin');
    }
    this.adminData = {
      userId: user.tokenDecoded.id,
      food: [],
    };
  }

  clearAdminData() {
    this.adminData = undefined;
    this.foodSubject.next([]);
  }

  addFood(food: Food): Observable<Food> {
    validateFood(food);
    return this.useMock ? this.addFoodMock(food) : this.addFoodServer(food);
  }

  updateFood(food: Food): Observable<Food> {
    validateFood(food);
    return this.useMock
      ? this.updateFoodMock(food)
      : this.updateFoodServer(food);
  }

  deleteFood(food: Food): Observable<void> {
    return this.useMock
      ? this.deleteFoodMock(food)
      : this.deleteFoodServer(food);
  }

  private addFoodServer(food: Food): Observable<Food> {
    return this.http.post<Food>('/api/food', food).pipe(
      tap((newFood: Food) => {
        if (this.adminData) {
          this.adminData.food.push(newFood);
          this.foodSubject.next(this.adminData.food);
        }
      }),
      catchError(this.handleError<Food>('addFoodServer'))
    );
  }

  private addFoodMock(food: Food): Observable<Food> {
    return of(food).pipe(
      tap((newFood: Food) => {
        if (this.adminData) {
          this.adminData.food.push(newFood);
          this.foodSubject.next(this.adminData.food);
        }
      }),
      catchError(this.handleError<Food>('addFoodMock'))
    );
  }

  private updateFoodServer(food: Food): Observable<Food> {
    return this.http.put<Food>(`/api/food/${food.userId}`, food).pipe(
      tap((updatedFood: Food) => {
        if (this.adminData) {
          const index = this.adminData.food.findIndex(
            (f) => f.userId === food.userId
          );
          if (index !== -1) {
            this.adminData.food[index] = updatedFood;
            this.foodSubject.next(this.adminData.food);
          }
        }
      }),
      catchError(this.handleError<Food>('updateFoodServer'))
    );
  }

  private updateFoodMock(food: Food): Observable<Food> {
    return of(food).pipe(
      tap((updatedFood: Food) => {
        if (this.adminData) {
          const index = this.adminData.food.findIndex(
            (f) => f.userId === food.userId
          );
          if (index !== -1) {
            this.adminData.food[index] = updatedFood;
            this.foodSubject.next(this.adminData.food);
          }
        }
      }),
      catchError(this.handleError<Food>('updateFoodMock'))
    );
  }

  private deleteFoodServer(food: Food): Observable<void> {
    return this.http.delete<void>(`/api/food/${food.userId}`).pipe(
      tap(() => {
        if (this.adminData) {
          this.adminData.food = this.adminData.food.filter(
            (f) => f.userId !== food.userId
          );
          this.foodSubject.next(this.adminData.food);
        }
      }),
      catchError(this.handleError<void>('deleteFoodServer'))
    );
  }

  private deleteFoodMock(food: Food): Observable<void> {
    return of(undefined).pipe(
      tap(() => {
        if (this.adminData) {
          this.adminData.food = this.adminData.food.filter(
            (f) => f.userId !== food.userId
          );
          this.foodSubject.next(this.adminData.food);
        }
      }),
      catchError(this.handleError<void>('deleteFoodMock'))
    );
  }

  private fetchFood(): Observable<Food[]> {
    if (!this.adminData) {
      throw new Error('User not connected');
    }
    const mockFoods: Food[] = [
      {
        id: 'food1',
        userId: 'user1',
        timestamp: Date.now(),
        name: 'Apple',
        calories: 95,
        cheating: false,
      },
      {
        id: 'food2',
        userId: 'user2',
        timestamp: Date.now(),
        name: 'Banana',
        calories: 105,
        cheating: false,
      },
      {
        id: 'food3',
        userId: 'user2',
        timestamp: 100,
        name: 'Chocolate',
        calories: 250,
        cheating: true,
      },
    ];
    return of(mockFoods).pipe(
      tap((foods: Food[]) => {
        if (this.adminData) {
          this.adminData.food = foods;
          this.foodSubject.next(foods);
        }
      }),
      catchError(this.handleError<Food[]>('fetchFood', []))
    );
  }

  getFood(): Observable<Food[]> {
    if (!this.adminData) {
      throw new Error('User not connected');
    }
    if (this.adminData.food.length === 0) {
      this.fetchFood().subscribe();
    }
    return this.foodSubject.asObservable();
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(result as T);
    };
  }
}
