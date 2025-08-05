import { inject, Injectable, NgZone, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private zone = inject(NgZone);
  private socket: Socket;

  constructor() {
    this.socket = io(environment.apiUrl, {
      transports: ['websocket'],
    });
  }

  on<T = any>(event: string, handler: (data: T) => void) {
    this.socket.on(event, (data: T) => this.zone.run(() => handler(data)));
  }

  off(event: string, handler?: (...args: any[]) => void) {
    this.socket.off(event, handler);
  }

  emit(event: string, payload?: any) {
    this.socket.emit(event, payload);
  }

  ngOnDestroy() {
    this.socket.removeAllListeners();
    this.socket.disconnect();
  }
}
