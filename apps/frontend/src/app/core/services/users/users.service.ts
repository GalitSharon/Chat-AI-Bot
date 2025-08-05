import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../models/user.model';
import { SocketService } from '../socket/socket.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService implements OnDestroy {
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();
  private socketService = inject(SocketService);

  private readonly _meUser = signal<User | null>(null);
  readonly meUser = this._meUser.asReadonly();

  private userAllHandler = (users: User[]) => this.usersSubject.next(users);

  private userJoinHandler = (newUser: User) => {
    const currentUsers = this.usersSubject.value;
    const filteredUsers = currentUsers.filter((user) => user.uuid !== newUser.uuid);
    this.usersSubject.next([...filteredUsers, newUser]);
  };

  private userLeaveHandler = (userId: string) => {
    const currentUsers = this.usersSubject.value;
    const filteredUsers = currentUsers.filter((user) => user.id !== userId);
    this.usersSubject.next(filteredUsers);
  };

  constructor() {
    this.initializeSocketListeners();
  }

  private initializeSocketListeners(): void {
    this.socketService.on<User[]>('user:all', this.userAllHandler);
    this.socketService.on<User>('user:join', this.userJoinHandler);
    this.socketService.on<string>('user:leave', this.userLeaveHandler);
  }

  initUserFromStorage() {
    const meUser = localStorage.getItem('meUser');
    if (meUser) this._meUser.set(JSON.parse(meUser));
  }

  addUser(user: User): void {
    const currentUsers = this.usersSubject.value;
    this.usersSubject.next([...currentUsers, user]);
  }

  removeUser(id: string): void {
    const currentUsers = this.usersSubject.value;
    const filteredUsers = currentUsers.filter((user) => user.id !== id);
    this.usersSubject.next(filteredUsers);
  }

  setMeUser(user: User): void {
    this._meUser.set(user);
    localStorage.setItem('meUser', JSON.stringify(user));
    this.addUser(user);
    this.userJoin(user);
  }

  userJoin(user: User): void {
    this.socketService.emit('user:join', user);
  }

  ngOnDestroy(): void {
    this.socketService.off('user:all', this.userAllHandler);
    this.socketService.off('user:join', this.userJoinHandler);
    this.socketService.off('user:leave', this.userLeaveHandler);
    this.usersSubject.complete();
  }
}
