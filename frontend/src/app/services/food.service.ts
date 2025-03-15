import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { DateFilter, Food, validateFood } from '../models/food.model';
import { UserId } from '../models/user.model';
import { UserService } from './user.service';

interface UserData {
  userId: UserId;
  dateFilter: DateFilter;
  food: Food[];
}

@Injectable({
  providedIn: 'root',
})
export class FoodService {
  private userData?: UserData;
  private foodSubject = new BehaviorSubject<Food[]>([]);

  constructor(private http: HttpClient, private userService: UserService) {}

  public loadUserData() {
    const user = this.userService.getCurrentUser();
    if (!user) {
      throw new Error('User not found');
    }
    if (this.userData?.userId === user.tokenDecoded.id) {
      return;
    }
    this.userData = {
      userId: user.tokenDecoded.id,
      dateFilter: { from: 0, to: 0 },
      food: [],
    };
  }

  clearUserData() {
    this.userData = undefined;
    this.foodSubject.next([]);
  }

  setDateFilter(dateFilter: DateFilter) {
    if (!this.userData) {
      throw new Error('fail loading user data');
    } else {
      this.userData.dateFilter = dateFilter;
    }
  }

  addFood(food: Food): Observable<Food> {
    if (!validateFood(food)) {
      throw new Error('Invalid food data');
    }
    return this.addFoodMock(food);
  }

  private addFoodServer(food: Food): Observable<Food> {
    return this.http.post<Food>('/api/food', food).pipe(
      tap((newFood: Food) => {
        if (this.userData) {
          this.userData.food.push(newFood);
          this.foodSubject.next(this.userData.food);
        }
      }),
      catchError(this.handleError<Food>('addFoodServer'))
    );
  }

  private addFoodMock(food: Food): Observable<Food> {
    return of(food).pipe(
      tap((newFood: Food) => {
        if (this.userData) {
          this.userData.food.push(newFood);
          this.foodSubject.next(this.userData.food);
        }
      }),
      catchError(this.handleError<Food>('addFoodMock'))
    );
  }

  // private fetchFood(): Observable<Food[]> {
  //   if (!this.userData) {
  //     throw new Error('User not connected');
  //   }
  //   const currentUserId = this.userData.userId;
  //   return this.http.get<Food[]>('/api/food').pipe(
  //     tap((foods: Food[]) => {
  //       if (this.userData && this.userData.userId === currentUserId) {
  //         this.userData.food = foods;
  //         this.foodSubject.next(foods);
  //       }
  //     }),
  //     catchError(this.handleError<Food[]>('fetchFood', []))
  //   );
  // }

  //Mock data not connected to the backend
  private fetchFood(): Observable<Food[]> {
    if (!this.userData) {
      throw new Error('User not connected');
    }
    const mockFoods: Food[] = [
      {
        id: 'food1',
        userId: this.userData.userId,
        timestamp: Date.now(),
        name: 'Apple',
        calories: 95,
        cheating: false,
      },
      {
        id: 'food2',
        userId: this.userData.userId,
        timestamp: Date.now(),
        name: 'Banana',
        calories: 105,
        cheating: false,
      },
      {
        id: 'food3',
        userId: this.userData.userId,
        timestamp: 100,
        name: 'Chocolate',
        calories: 250,
        cheating: true,
      },
    ];
    return of(mockFoods).pipe(
      tap((foods: Food[]) => {
        if (this.userData) {
          this.userData.food = foods;
          this.foodSubject.next(foods);
        }
      }),
      catchError(this.handleError<Food[]>('fetchFood', []))
    );
  }

  getFood(): Observable<Food[]> {
    if (!this.userData) {
      throw new Error('User not connected');
    }
    if (this.userData && this.userData.food.length === 0) {
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
