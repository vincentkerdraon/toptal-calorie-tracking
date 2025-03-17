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
import { LocaleDatePipe } from '../../pipes/locale-date.pipe';
import { FoodService } from '../../services/food.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, LocaleDatePipe],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private foodList: Food[] = [];
  foodListFiltered: Food[] = [];
  caloriesPerDay: { date: string; calories: number }[] = [];
  filterForm: FormGroup;
  foodForm: FormGroup;
  user: User | null = null;

  constructor(
    private foodService: FoodService,
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.foodService.loadUserData();

    //default date for forms
    const today = new Date().toISOString().split('T')[0];
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const twoWeeksAgoDate = twoWeeksAgo.toISOString().split('T')[0];

    this.filterForm = this.fb.group({
      from: [twoWeeksAgoDate, Validators.required],
      to: [today, Validators.required],
    });

    this.foodForm = this.fb.group({
      name: ['', [Validators.required]],
      calories: ['', [Validators.required, Validators.min(1)]],
      date: [today, [Validators.required]],
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
    this.foodListFiltered = this.foodList
      .filter((f) => f.timestamp >= from && f.timestamp <= to)
      .sort((f1, f2) => f2.timestamp - f1.timestamp);

    this.calculateCaloriesPerDay();
  }

  calculateCaloriesPerDay(): void {
    //FIXNE add entry for day: day doesn't show up in Calories per day

    const caloriesMap: { [date: string]: number } = {};
    this.foodListFiltered.forEach((food) => {
      const date = new Date(food.timestamp).toISOString().split('T')[0];
      if (!caloriesMap[date]) {
        caloriesMap[date] = 0;
      }
      caloriesMap[date] += food.calories;
    });
    this.caloriesPerDay = Object.keys(caloriesMap)
      .map((date) => ({
        date,
        calories: caloriesMap[date],
      }))
      .sort(
        (f1, f2) => new Date(f2.date).getTime() - new Date(f1.date).getTime()
      );
  }

  onAddFood(): void {
    if (!this.foodForm.valid) {
      //FIXME sometimes !valid, not sure why.
      return;
    }
    let date = new Date(this.foodForm.value.date);
    let cheating = this.foodForm.value.cheating;
    if (cheating == null) {
      cheating = false;
    }
    const newFood: Food = {
      id: '', //will be set by the backend
      name: this.foodForm.value.name,
      calories: this.foodForm.value.calories,
      cheating: cheating,
      timestamp: date.getTime(), //FIXME UTC
      userId: this.userService.getCurrentUser()?.tokenDecoded.id || '',
    };

    this.foodService.addFood(newFood).subscribe(() => {
      this.foodForm.reset();
    });

    this.applyFilter();
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
      this.userService.updateSettings(
        this.user.tokenDecoded.id,
        this.user.settings
      );
    }
  }
}
