import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { DateFilter, Food, foodApi, validateFood } from '../models/food.model';
import { TokenEncoded } from '../models/token.model';
import { UserId } from '../models/user.model';
import { UserService } from './user.service';

interface UserData {
  userId: UserId;
  tokenEncoded: TokenEncoded;
  dateFilter: DateFilter;
  foods: Food[];
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
      tokenEncoded: user.tokenEncoded,
      dateFilter: { from: 0, to: 0 },
      foods: [],
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
    validateFood(food);
    return this.addFoodServer(food);
  }

  private addFoodServer(food: Food): Observable<Food> {
    if (!this.userData) {
      throw new Error('User not connected');
    }
    const headers = { Authorization: `Bearer ${this.userData.tokenEncoded}` };
    return this.http
      .post<Food>(environment.backend + foodApi, food, { headers })
      .pipe(
        tap((newFood: Food) => {
          if (this.userData) {
            this.userData.foods.push(newFood);
            this.foodSubject.next(this.userData.foods);
          }
        }),
        catchError(this.handleError<Food>('addFoodServer'))
      );
  }

  private fetchFood(): Observable<Food[]> {
    if (!this.userData) {
      throw new Error('User not connected');
    }
    let params = new HttpParams();
    params = params.append('userIDs', this.userData.userId);
    const headers = {
      headers: {
        Authorization: `Bearer ${this.userData.tokenEncoded}`,
        'Content-Type': 'application/json',
      },
      params: params,
    };
    return this.http.get<Food[]>(environment.backend + foodApi, headers).pipe(
      tap((foods: Food[]) => {
        if (foods == null) {
          foods = [];
        }
        if (this.userData && this.userData.userId === this.userData.userId) {
          this.userData.foods = foods;
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
    if (this.userData && this.userData.foods.length === 0) {
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
