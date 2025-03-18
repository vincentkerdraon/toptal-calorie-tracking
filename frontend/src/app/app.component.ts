import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NotificationService } from './services/notification.service';
import { UserService } from './services/user.service';
import { NotificationDisplayComponent } from "./views/notification-display/notification-display.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, CommonModule, NotificationDisplayComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor(public userService: UserService, public notificationService: NotificationService) {}
}
