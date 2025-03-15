import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserId } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private currentUser: User | null = null;

  // SampleProject: fake data
  users: User[] = [
    {
      id: 'user1',
      tokenEncoded: 'token_user1',
      token: { id: 'user1', name: 'user1', role: 'user' },
    },
    {
      id: 'user2',
      tokenEncoded: 'token_user2',
      token: { id: 'user2', name: 'user2', role: 'user' },
    },
    {
      id: 'user3',
      tokenEncoded: 'token_user3',
      token: { id: 'user3', name: 'user3', role: 'user' },
    },
    {
      id: 'admin1',
      tokenEncoded: 'token_admin1',
      token: { id: 'admin1', name: 'admin1', role: 'admin' },
    },
    {
      id: 'admin2',
      tokenEncoded: 'token_admin2',
      token: { id: 'admin2', name: 'admin2', role: 'admin' },
    },
  ];

  constructor(private router: Router) {
    this.loadUserFromLocalStorage();
  }

  public getUsersId(): UserId[] {
    return this.users.map((u) => u.id);
  }

  // SampleProject: this is a fake authenticate. In a real application, call the backend.
  // or visit the app with already a token.
  auth(id: UserId): User | null {
    const user = this.users.find((u) => u.id === id);
    if (user) {
      this.currentUser = user;
      this.saveUserToLocalStorage(user);
      return user;
    }
    return null;
  }

  logout() {
    this.currentUser = null;
    this.removeUserFromLocalStorage();
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  private saveUserToLocalStorage(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  private loadUserFromLocalStorage(): void {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      this.currentUser = JSON.parse(userJson);
    }
  }

  private removeUserFromLocalStorage(): void {
    localStorage.removeItem('currentUser');
  }
}
