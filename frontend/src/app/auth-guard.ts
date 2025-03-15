import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from './services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(): boolean {
    if (this.userService.getCurrentUser()) {
      return true;
    } else {
      console.error('Connected user access only');
      this.router.navigate(['/login']);
      return false;
    }
  }
}

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(): boolean {
    const user = this.userService.getCurrentUser();
    if (user && user.tokenDecoded.role === 'admin') {
      return true;
    } else {
      console.error('Admin access only');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
