import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Food } from '../../models/food.model';
import { FoodAdminService } from '../../services/foodAdmin.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-reporting',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reporting.component.html',
})
export class ReportingComponent implements OnInit {
  foodList: Food[] = [];
  foodForm: FormGroup;
  selectedFood: Food | null = null;

  constructor(
    private foodAdminService: FoodAdminService,
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.foodAdminService.loadAdminData();

    this.foodForm = this.fb.group({
      name: ['', Validators.required],
      calories: ['', [Validators.required, Validators.min(1)]],
      timestamp: ['', Validators.required],
      cheating: [false],
    });
  }

  ngOnInit(): void {
    this.loadFood();
  }

  loadFood(): void {
    this.foodAdminService.getFood().subscribe((foods) => {
      this.foodList = foods;
    });
  }

  onSelectFood(food: Food): void {
    this.selectedFood = food;
    this.foodForm.patchValue({
      name: food.name,
      calories: food.calories,
      timestamp: new Date(food.timestamp).toISOString().split('T')[0],
      cheating: food.cheating,
    });
  }

  onSaveFood(): void {
    if (this.foodForm.valid) {
      const foodData: Food = {
        // id: this.selectedFood?.id,
        // userId: this.selectedFood?.id,
        id: 'aaa', //FIXME
        userId: 'aaa', //FIXME
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
