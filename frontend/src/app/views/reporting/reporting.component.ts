import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Food } from '../../models/food.model';
import { FoodAdminService } from '../../services/foodAdmin.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-reporting',
  imports: [ReactiveFormsModule, CommonModule,FormsModule],
  templateUrl: './reporting.component.html',
})
export class ReportingComponent implements OnInit {
  foodList: Food[] = [];
  foodListFiltered: Food[] = [];
  foodForm: FormGroup;
  filterDateFrom:string;
  filterDateTo:string;
  selectedFood: Food | null = null;
  last7DaysEntries: number = 0;
  previous7DaysEntries: number = 0;
  averageCaloriesPerUser: number = 0;
  caloriesPerDayPerUser: {
    userId: string;
    date: string;
    calories: number;
    threshold?: number;
  }[] = [];
  userFollowUp: {
    userId: string;
    last7DaysEntries: number;
    previous7DaysEntries: number;
  }[] = [];

  constructor(
    private foodAdminService: FoodAdminService,
    private fb: FormBuilder,
    public userService: UserService
  ) {
    this.foodAdminService.loadAdminData();

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const today = new Date().toISOString().split('T')[0]
    this.filterDateFrom = twoWeeksAgo.toISOString().split('T')[0];
    this.filterDateTo=new Date().toISOString().split('T')[0];
    
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
    //to always include the whole day
    // to += 24 * 60 * 60 * 1000; //FIXME

    const fromTimestamp = new Date(this.filterDateFrom).getTime();
    const toTimestamp = new Date(this.filterDateTo).getTime();

    this.foodListFiltered = this.foodList
      .filter((food) => food.timestamp <= toTimestamp && food.timestamp >= fromTimestamp)
      .sort((a, b) => {
      if (a.userId === b.userId) {
        if (b.timestamp == a.timestamp){
          return b.calories-a.calories
        }
        return b.timestamp - a.timestamp;
      }
      return a.userId.localeCompare(b.userId);
      });
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
    // const userIdFilter = this.filterForm.value.userId || ''; //FIXME

    this.foodListFiltered
      // .filter((food) => !userIdFilter || food.userId === userIdFilter)
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
            threshold: this.userService.getUserSettings(food.userId)?.caloryThreshold
          });
        }
      });
  }

  onSelectFood(food: Food): void {
    this.selectedFood = food;
    this.foodForm.patchValue({
      userId: food.userId,
      name: food.name,
      calories: food.calories,
      date: new Date(food.timestamp).toISOString().split('T')[0],
      cheating: food.cheating,
    });
  }

  onSaveFood(): void {
    if (!this.foodForm.valid) {
      return
    }
    let cheating = this.foodForm.value.cheating;
    if (cheating == null) {
      cheating = false;
    }
    const foodData: Food = {
      id: this.selectedFood?.id || '',
      userId: this.foodForm.value.userId,
      name: this.foodForm.value.name,
      calories: this.foodForm.value.calories,
      timestamp: new Date(this.foodForm.value.date).getTime(),
      cheating: cheating,
    };

    if (this.selectedFood) {
      // Update existing food
      this.foodAdminService.updateFood(foodData).subscribe(() => {
        this.calculateStatistics();
        this.applyFilter();
        this.selectedFood = null;
        this.foodForm.reset();
      });
    } else {
      // Create new food
      this.foodAdminService.addFood(foodData).subscribe(() => {
        this.calculateStatistics();
        this.applyFilter();
        this.foodForm.reset();
      });
    }
  }

  onDeleteFood(food: Food): void {
    this.foodAdminService.deleteFood(food).subscribe(() => {
      this.calculateStatistics();
      this.applyFilter();
    });
  }
}
