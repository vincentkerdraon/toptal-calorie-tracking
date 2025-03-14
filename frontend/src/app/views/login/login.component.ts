import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ID } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [CommonModule],
  styles: [],
})
export class LoginComponent {
  users: ID[];
  constructor(private router: Router, private userService: UserService) {
    this.users = this.userService.getUsersId();
  }

  auth(user_id: string) {
    if (this.userService.auth(user_id) != null) {
      this.router.navigate(['/dashboard']);
    }
    //FIXME ELSE
  }
}
