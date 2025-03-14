import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  constructor(public userService: UserService) {}
}
