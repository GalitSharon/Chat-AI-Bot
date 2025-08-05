import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../core/models/user.model';
import { UserDisplayComponent } from './user-display/user-display.component';

@Component({
  selector: 'app-users-panel',
  imports: [CommonModule, UserDisplayComponent],
  templateUrl: './users-panel.component.html',
  styleUrl: './users-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersPanelComponent implements OnChanges {
  @Input({ required: true }) users: User[] = [];
  @Input() currentUserId: string | null = null;

  meUser: User | null = null;
  otherUsers: User[] = [];

  ngOnChanges() {
    this.separateUsers();
  }

  private separateUsers() {
    this.meUser = this.findCurrentUser();
    this.otherUsers = Array.from(new Map(this.users.map(user => [user.uuid, user])).values());
    this.otherUsers = this.otherUsers.filter((user) => (user.uuid !== this.meUser?.uuid ) );

  }

  private findCurrentUser(): User | null {
    const userById = this.findUserById();
    const userFromStorage = this.findUserFromStorage();
    return userById || userFromStorage || this.users[0] || null;
  }

  private findUserById(): User | null {
    if (!this.currentUserId) return null;
    return this.users.find((user) => user.id === this.currentUserId) || null;
  }

  private findUserFromStorage(): User | null {
    if (!this.currentUserId) return null;

    const storedUserJson = localStorage.getItem('meUser');
    if (!storedUserJson) return null;

    const storedUser = JSON.parse(storedUserJson);
    if (!storedUser?.name) return null;
    return this.users.find((user) => user.name === storedUser.name) || null;
  }
}
