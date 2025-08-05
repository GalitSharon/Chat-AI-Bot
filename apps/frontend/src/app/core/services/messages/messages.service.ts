import { inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Message } from '../../models/message.model';
import { SocketService } from '../socket/socket.service';
import { UsersService } from '../users/users.service';

@Injectable({
  providedIn: 'root',
})
export class MessagesService implements OnDestroy {
  private socketService = inject(SocketService);
  private usersService = inject(UsersService);

  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private messageNewHandler = (message: Message) =>
    this.messagesSubject.next([...this.messagesSubject.value, message]);

  private messageAllHandler = (messages: Message[]) =>
    this.messagesSubject.next(messages);

  constructor() {
    this.initializeSocketListeners();
  }

  private initializeSocketListeners(): void {
    this.socketService.on<Message>('message:new', this.messageNewHandler);
    this.socketService.on<Message[]>('message:all', this.messageAllHandler);
  }

  addMessage(message: Message): void {
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, message]);
  }

  sendMessage(inputText: string): void {
    const text = inputText.trim();
    if (!text) return;
    const meUser = this.usersService.meUser();
    if (!meUser) return;
    const id = crypto.randomUUID();
    const message: Message = {
      id,
      text,
      senderName: meUser.name,
      senderId: meUser.id,
      senderType: 'USER',
      createdAt: new Date().toISOString(),
    };

    this.messagesSubject.next([...this.messagesSubject.value, message]);
    this.socketService.emit('message:send', message);
  }

  updateMessage(id: string, text: string): void {
    const messages = this.messagesSubject.value.map((msg) => {
      if (msg.id === id) {
        msg.text = text;
      }
      return msg;
    });
    this.messagesSubject.next([...messages]);
    this.socketService.emit('message:update', { id, text });
  }

  ngOnDestroy(): void {
    this.socketService.off('message:new', this.messageNewHandler);
    this.socketService.off('message:all', this.messageAllHandler);
    this.messagesSubject.complete();
  }
}
