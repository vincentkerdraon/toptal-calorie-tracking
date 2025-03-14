import { Injectable } from '@angular/core';
import { ID, User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private currentUser: User | null = null;

  //SampleProject: fake data
  users: User[] = [
    {
      id: '1',
      tokenEncoded: 'token_user1',
      token: { id: '1', name: 'user1', role: 'user' },
    },
    {
      id: '2',
      tokenEncoded: 'token_user2',
      token: { id: '2', name: 'user2', role: 'user' },
    },
    {
      id: '3',
      tokenEncoded: 'token_user3',
      token: { id: '3', name: 'user3', role: 'user' },
    },
    {
      id: '4',
      tokenEncoded: 'token_admin1',
      token: { id: '1', name: 'admin1', role: 'admin' },
    },
    {
      id: '5',
      tokenEncoded: 'token_admin2',
      token: { id: '2', name: 'admin2', role: 'admin' },
    },
  ];

  constructor() {
    //FIXME save to local storage for reloads.
    // for now, auto-connect
    this.auth('1');
  }

  public getUsersId(): ID[] {
    return this.users.map((u) => u.id);
  }

  //SampleProject: this is a fake authenticate. In a real application, call the backend.
  //or visit the app with already a token.
  auth(id: ID): User | null {
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
