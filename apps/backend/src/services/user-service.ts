import { User } from '../models/user.model';

export class UserService {
  private connectedUsers: User[] = [];

  addUser(socketId: string): void {
    if (!this.connectedUsers.find(user => user.id === socketId)) {
      this.connectedUsers.push({ id: socketId });
    }
  }

  setUserName(socketId: string, userName: string, uuid?: string): void {
    const user = this.connectedUsers.find(user => user.id === socketId);
    if (user && !user.name) {
      user.name = userName;
      user.uuid = uuid;
    }
  }

  removeUser(socketId: string): void {
    const index = this.connectedUsers.findIndex(user => user.id === socketId);
    if (index !== -1) {
      this.connectedUsers.splice(index, 1);
    }
  }

  getAllUsers(): User[] {
    return this.connectedUsers;
  }

  getUserBySocketId(socketId: string): User | undefined {
    return this.connectedUsers.find(user => user.id === socketId);
  }
}