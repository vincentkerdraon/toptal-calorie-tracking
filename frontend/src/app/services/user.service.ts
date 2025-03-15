import { Injectable } from '@angular/core';
import { User, UserId } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private currentUser: User | null = null;

  //SampleProject: fake data
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

  constructor() {
    //FIXME save to local storage for reloads.
    // for now, auto-connect
    this.auth('1');
  }

  public getUsersId(): UserId[] {
    return this.users.map((u) => u.id);
  }

  //SampleProject: this is a fake authenticate. In a real application, call the backend.
  //or visit the app with already a token.
  auth(id: UserId): User | null {
    const user = this.users.find((u) => u.id === id);
    if (user) {
      this.currentUser = user;
      return user;
    }
    return null;
  }

  logout() {
    this.currentUser = null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
}
