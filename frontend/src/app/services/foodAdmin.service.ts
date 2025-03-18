import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Food, foodApi, validateFood } from '../models/food.model';
import { TokenEncoded } from '../models/token.model';
import { UserId } from '../models/user.model';
import { NotificationLevel, NotificationService } from './notification.service';
import { UserService } from './user.service';

interface AdminData {
  userId: UserId;
  tokenEncoded: TokenEncoded;
  food: Food[];
}

@Injectable({
  providedIn: 'root',
})
export class FoodAdminService {
  private adminData?: AdminData;
  private foodSubject = new BehaviorSubject<Food[]>([]);

  constructor(private http: HttpClient, private userService: UserService,private notificationService:NotificationService) {}

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
      tokenEncoded: user.tokenEncoded,
      food: [],
    };
  }

  clearAdminData() {
    this.adminData = undefined;
    this.foodSubject.next([]);
  }

  addFood(food: Food): Observable<Food> {
    validateFood(food);
    if (!this.adminData) {
      throw new Error('User not connected');
    }
    const headers = {
      headers: {
        Authorization: `Bearer ${this.adminData.tokenEncoded}`,
        'Content-Type': 'application/json',
      },
    };
    return this.http.post<Food>(environment.backend + foodApi, food ,headers).pipe(
      tap((newFood: Food) => {
        if (this.adminData) {
          this.adminData.food.push(newFood);
          this.foodSubject.next(this.adminData.food);
        }
      }),
      catchError(this.handleError<Food>('addFoodServer'))
    );
  }

  updateFood(food: Food): Observable<Food> {
    validateFood(food);    
    if (!this.adminData) {
      throw new Error('User not connected');
    }
    const headers = {
      headers: {
        Authorization: `Bearer ${this.adminData.tokenEncoded}`,
        'Content-Type': 'application/json',
      },
    };
    return this.http
      .put<Food>(environment.backend + foodApi +"/"+ food.id, food,headers)
      .pipe(
        tap((updatedFood: Food) => {
          if (this.adminData) {
            const index = this.adminData.food.findIndex(
              (f) => f.id === food.id
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

  deleteFood(food: Food): Observable<void> {
    if (!this.adminData) {
      throw new Error('User not connected');
    }
    const headers = { Authorization: `Bearer ${this.adminData.tokenEncoded}` };
    return this.http
      .delete<void>(environment.backend + foodApi +"/"+ food.id,{headers})
      .pipe(
        tap(() => {
          if (this.adminData) {
            this.adminData.food = this.adminData.food.filter(
              (f) => f.id !== food.id
            );
            this.foodSubject.next(this.adminData.food);
          }
        }),
        catchError(this.handleError<void>('deleteFoodServer'))
      );
  }

  private fetchFood(): Observable<Food[]> {
    if (!this.adminData) {
      throw new Error('User not connected');
    }
    const headers = {
      headers: {
        Authorization: `Bearer ${this.adminData.tokenEncoded}`,
        'Content-Type': 'application/json',
      },
    };
    return this.http.get<Food[]>(environment.backend + foodApi, headers).pipe(
      tap((foods: Food[]) => {
        if (foods == null) {
          foods = [];
        }
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
      console.error(error)
        if (error.error.Error){
          this.notificationService.showMessage(NotificationLevel.Danger, "(operation=" + operation + ") Error:" + error.error.Error )
        }else{
          this.notificationService.showMessage(NotificationLevel.Danger,"(operation=" + operation + ") " + (error.message || error.toString()) )
        }
      return of(result as T);
    }; 
  }
}
