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
import { User } from '../../models/user.model';
import { FoodService } from '../../services/food.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private foodList: Food[] = [];
  foodListFiltered: Food[] = [];
  caloriesPerDay: { date: string; calories: number }[] = [];
  filterForm: FormGroup;
  addFoodForm: FormGroup;
  user: User | null = null;

  constructor(
    private foodService: FoodService,
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.foodService.loadUserData();
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    this.filterForm = this.fb.group({
      from: ['', Validators.required],
      to: [today, Validators.required],
    });

    this.addFoodForm = this.fb.group({
      name: ['', Validators.required],
      calories: ['', [Validators.required, Validators.min(1)]],
      timestamp: ['', Validators.required],
      cheating: [false],
    });
  }

  ngOnInit(): void {
    this.foodService.getFood().subscribe((foods) => {
      this.foodList = foods;
      this.applyFilter();
    });
    this.user = this.userService.getCurrentUser();
  }

  applyFilter(): void {
    let from = new Date(this.filterForm.value.from).getTime();
    if (isNaN(from)) {
      from = 0;
    }
    let to = new Date(this.filterForm.value.to).getTime();
    if (isNaN(to)) {
      //if not set, set to the end of the day
      to = new Date(Date.now()).setUTCHours(0, 0, 0, 0);
    }
    //to always include the whole day
    to += 24 * 60 * 60 * 1000;
    this.foodListFiltered = this.foodList.filter(
      (food) => food.timestamp >= from && food.timestamp <= to
    );
    this.calculateCaloriesPerDay();
  }

  calculateCaloriesPerDay(): void {
    const caloriesMap: { [date: string]: number } = {};
    this.foodListFiltered.forEach((food) => {
      const date = new Date(food.timestamp).toISOString().split('T')[0];
      if (!caloriesMap[date]) {
        caloriesMap[date] = 0;
      }
      caloriesMap[date] += food.calories;
    });
    this.caloriesPerDay = Object.keys(caloriesMap).map((date) => ({
      date,
      calories: caloriesMap[date],
    }));
  }

  onAddFood(): void {
    if (this.addFoodForm.valid) {
      const newFood: Food = {
        id: '', //will be set by the backend
        name: this.addFoodForm.value.name,
        calories: this.addFoodForm.value.calories,
        cheating: this.addFoodForm.value.cheating,
        timestamp: this.addFoodForm.value.timestamp,
        userId: this.userService.getCurrentUser()?.tokenDecoded.id || '',
      };
      this.foodService.addFood(newFood).subscribe(() => {
        this.addFoodForm.reset();
      });
    }
  }

  setDateFilterToDay(date: string): void {
    this.filterForm.patchValue({
      from: date,
      to: date,
    });
    this.applyFilter();
  }

  updateThreshold(): void {
        if (this.user) {
      this.userService.updateSettings(this.user.tokenDecoded.id, this.user.settings);
    }
  }

}
