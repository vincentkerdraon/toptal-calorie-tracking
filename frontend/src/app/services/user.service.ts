import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserId, UserSettings } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private currentUser: User | null = null;

  // SampleProject: fake data
  users: User[] = [
    //FIXME better test data
    {
      tokenEncoded: 'token_user1',
      tokenDecoded: { id: 'user1', role: 'user' },
      settings: { caloryThreshold: 2100 },
    },
    {
      tokenEncoded: 'token_user2',
      tokenDecoded: { id: 'user2',  role: 'user' },
      settings: { caloryThreshold: 2300 },
    },
    {
      tokenEncoded: 'token_user3',
      tokenDecoded: { id: 'user3',  role: 'user' },
      settings: { caloryThreshold: 2100 },
    },
    {
      tokenEncoded: 'token_admin1',
      tokenDecoded: { id: 'admin1',  role: 'admin' },
      settings: { caloryThreshold: 2100 },
    },
    {
      tokenEncoded: 'token_admin2',
      tokenDecoded: { id: 'admin2',  role: 'admin' },
      settings: { caloryThreshold: 2100 },
    },
  ];

  constructor(private router: Router) {
    this.loadUserFromLocalStorage();
  }

  public getUsersId(): UserId[] {
    return this.users.map((u) => u.tokenDecoded.id);
  }

  // SampleProject: this is a fake authenticate. In a real application, call the backend.
  // or visit the app with already a token.
  auth(id: UserId): User | null {
    const user = this.users.find((u) => u.tokenDecoded.id === id);
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

  public updateSettings(id: UserId, settings: UserSettings) {
    const user = this.users.find((u) => u.tokenDecoded.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    //FIXME send to backend to persist
    user.settings = settings;
    this.saveUserToLocalStorage(user);
  }

  public getUserSettings(userId:UserId) :UserSettings|null{
    const user = this.users.find((u) => u.tokenDecoded.id === userId);
    if (!user) {
      return null
    }
    return user.settings
  }
}
