import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Food } from '../../models/food.model';
import { FoodService } from '../../services/food.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private foodList: Food[] = [];
  foodListFiltered: Food[] = [];
  filterForm: FormGroup;
  addFoodForm: FormGroup;

  constructor(
    private foodService: FoodService,
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.filterForm = this.fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required],
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
  }

  applyFilter(): void {
    let from = new Date(this.filterForm.value.from).getTime();
    if (isNaN(from)) {
      from = 0;
    }
    let to = new Date(this.filterForm.value.to).getTime();
    if (isNaN(to)) {
      //if not set, set to the end of the day
      to = new Date(Date.now() + 24 * 60 * 60 * 1000).setUTCHours(0, 0, 0, 0);
    }
    this.foodListFiltered = this.foodList.filter(
      (food) => food.timestamp >= from && food.timestamp <= to
    );
  }

  onFilterChange(): void {
    this.applyFilter();
  }

  onAddFood(): void {
    if (this.addFoodForm.valid) {
      const newFood: Food = {
        name: this.addFoodForm.value.name,
        calories: this.addFoodForm.value.calories,
        cheating: this.addFoodForm.value.cheating,
        //set by backend
        userID: '',
        timestamp: 0,
      };
      this.foodService.addFood(newFood).subscribe(() => {
        this.addFoodForm.reset();
      });
    }
  }
}
