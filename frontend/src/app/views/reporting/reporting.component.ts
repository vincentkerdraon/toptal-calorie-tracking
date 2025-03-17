import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Food } from '../../models/food.model';
import { LocaleDatePipe } from '../../pipes/locale-date.pipe';
import { FoodAdminService } from '../../services/foodAdmin.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-reporting',
  imports: [ReactiveFormsModule, CommonModule, LocaleDatePipe],
  templateUrl: './reporting.component.html',
})
export class ReportingComponent implements OnInit {
  foodList: Food[] = [];
  foodListFiltered: Food[] = [];
  foodForm: FormGroup;
  filterForm: FormGroup;
  selectedFood: Food | null = null;
  last7DaysEntries: number = 0;
  previous7DaysEntries: number = 0;
  averageCaloriesPerUser: number = 0;
  caloriesPerDayPerUser: {
    userId: string;
    date: string;
    calories: number;
  }[] = [];
  userFollowUp: {
    userId: string;
    last7DaysEntries: number;
    previous7DaysEntries: number;
  }[] = [];

  constructor(
    private foodAdminService: FoodAdminService,
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.foodAdminService.loadAdminData();

    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    this.filterForm = this.fb.group({
      from: ['', Validators.required],
      to: [today, Validators.required],
    });

    this.foodForm = this.fb.group({
      userId: ['', Validators.required],
      name: ['', Validators.required],
      calories: ['', [Validators.required, Validators.min(1)]],
      date: [today, Validators.required],
      cheating: [false],
    });
  }

  ngOnInit(): void {
    this.loadFood();
  }

  loadFood(): void {
    this.foodAdminService.getFood().subscribe((foods) => {
      this.foodList = foods;
      this.calculateStatistics();
      this.applyFilter();
    });
  }

  applyFilter(): void {
    let from = new Date(this.filterForm.value.from).getTime();
    if (isNaN(from)) {
      from = 0;
    }
    let to = new Date(this.filterForm.value.to).getTime();
    if (isNaN(to)) {
      //if not set, set today
      to = new Date(Date.now()).setUTCHours(0, 0, 0, 0);
    }
    //to always include the whole day
    to += 24 * 60 * 60 * 1000;
    this.foodListFiltered = this.foodList.filter(
      (food) => food.timestamp >= from && food.timestamp <= to
    );
    this.calculateCaloriesPerDayPerUser();
  }

  calculateStatistics(): void {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const last7DaysStart = now - 7 * oneDay;
    const previous7DaysStart = now - 14 * oneDay;
    const previous7DaysEnd = now - 7 * oneDay;

    this.last7DaysEntries = this.foodList.filter(
      (food) => food.timestamp >= last7DaysStart
    ).length;

    this.previous7DaysEntries = this.foodList.filter(
      (food) =>
        food.timestamp >= previous7DaysStart &&
        food.timestamp < previous7DaysEnd
    ).length;

    const userCaloriesMap: { [userId: string]: number } = {};
    const userLast7DaysEntriesMap: { [userId: string]: number } = {};
    const userPrevious7DaysEntriesMap: { [userId: string]: number } = {};

    this.foodList.forEach((food) => {
      const userId = food.userId;

      if (!userCaloriesMap[userId]) {
        userCaloriesMap[userId] = 0;
        userLast7DaysEntriesMap[userId] = 0;
        userPrevious7DaysEntriesMap[userId] = 0;
      }

      userCaloriesMap[userId] += food.calories;

      if (food.timestamp >= last7DaysStart) {
        userLast7DaysEntriesMap[userId] += 1;
      } else if (
        food.timestamp >= previous7DaysStart &&
        food.timestamp < previous7DaysEnd
      ) {
        userPrevious7DaysEntriesMap[userId] += 1;
      }
    });

    const totalUsers = Object.keys(userCaloriesMap).length;
    const totalCalories = Object.values(userCaloriesMap).reduce(
      (sum, calories) => sum + calories,
      0
    );

    this.averageCaloriesPerUser = totalUsers ? totalCalories / totalUsers : 0;

    this.userFollowUp = Object.keys(userCaloriesMap)
      .map((userId) => ({
        userId,
        last7DaysEntries: userLast7DaysEntriesMap[userId],
        previous7DaysEntries: userPrevious7DaysEntriesMap[userId],
      }))
      .sort((a, b) => a.userId.localeCompare(b.userId));
  }

  calculateCaloriesPerDayPerUser(): void {
    this.caloriesPerDayPerUser = [];
    const userIdFilter = this.filterForm.value.userId || '';

    this.foodListFiltered
      .filter((food) => !userIdFilter || food.userId === userIdFilter)
      .forEach((food) => {
        const date = new Date(food.timestamp).toISOString().split('T')[0];
        const userId = food.userId;
        const existingEntry = this.caloriesPerDayPerUser.find(
          (entry) => entry.date === date && entry.userId === userId
        );
        if (existingEntry) {
          existingEntry.calories += food.calories;
        } else {
          this.caloriesPerDayPerUser.push({
            userId,
            date,
            calories: food.calories,
          });
        }
      });

    this.caloriesPerDayPerUser.sort((a, b) => {
      if (a.userId === b.userId) {
        return a.date.localeCompare(b.date);
      }
      return a.userId.localeCompare(b.userId);
    });
  }

  onSelectFood(food: Food): void {
    this.selectedFood = food;
    this.foodForm.patchValue({
      userId: food.userId,
      name: food.name,
      calories: food.calories,
      timestamp: new Date(food.timestamp).toISOString().split('T')[0],
      cheating: food.cheating,
    });
  }

  onSaveFood(): void {
    if (this.foodForm.valid) {
      const foodData: Food = {
        id: this.selectedFood?.id || '',
        userId: this.foodForm.value.userId,
        name: this.foodForm.value.name,
        calories: this.foodForm.value.calories,
        timestamp: new Date(this.foodForm.value.timestamp).getTime(),
        cheating: this.foodForm.value.cheating,
      };

      if (this.selectedFood) {
        // Update existing food
        this.foodAdminService.updateFood(foodData).subscribe(() => {
          this.loadFood();
          this.selectedFood = null;
          this.foodForm.reset();
        });
      } else {
        // Create new food
        this.foodAdminService.addFood(foodData).subscribe(() => {
          this.loadFood();
          this.foodForm.reset();
        });
      }
    }
  }

  onDeleteFood(food: Food): void {
    this.foodAdminService.deleteFood(food).subscribe(() => {
      this.loadFood();
    });
  }

  onClearSelection(): void {
    this.selectedFood = null;
    this.foodForm.reset();
  }
}
