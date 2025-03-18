import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { FoodService } from '../../services/food.service';
import { NotificationLevel, NotificationService } from '../../services/notification.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [CommonModule],
  styles: [],
})
export class LoginComponent {
  users: User[];
  constructor(private router: Router, private userService: UserService,private notificationService: NotificationService,    private foodService: FoodService, ) {
    this.users = this.userService.getUsers();
  }

  auth(user_id: string) {
    if (this.userService.auth(user_id) != null) {
      this.router.navigate(['/dashboard']);
    }else{
      this.notificationService.showMessage(NotificationLevel.Danger,"Authentication failed")
    }
  }
}
