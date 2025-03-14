import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-reporting',
  imports: [CommonModule],
  templateUrl: './reporting.component.html',
})
export class ReportingComponent {
  constructor(public userService: UserService) {}
}
