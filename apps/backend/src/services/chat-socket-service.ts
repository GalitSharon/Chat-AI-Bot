import { Server as IOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { MessagesService } from './messages-service';
import { UserService } from './user-service';
import { BotService } from './bot-service';
import { ChatMessage, MessageSender } from './database-service';

export class ChatSocketService {
  private socketServer: IOServer;
  private funnyMessageInterval: NodeJS.Timeout | null = null;

  constructor(
    httpServer: HttpServer,
    private readonly messagesService: MessagesService,
    private readonly userService: UserService,
    private readonly botService: BotService
  ) {
    this.socketServer = new IOServer(httpServer, { cors: { origin: '*' } });
    this.setupSocketHandlers();
    this.startFunnyMessageTimer();
  }

  private setupSocketHandlers(): void {
    this.socketServer.on('connection', (socket) => {
      console.log('New socket connected:', socket.id);

      this.userService.addUser(socket.id);

      this.registerChatEvents(socket);

      socket.on('disconnect', (reason) => {
        this.handleUserLeave(socket);
        console.log('Socket disconnected:', { id: socket.id, reason });
      });
    });
  }

  private registerChatEvents(socket: Socket): void {
    socket.on('user:join', (data) => {
      this.handleUserJoin(socket, data);
    });
    socket.on('user:all', () => {
      this.handleUserAll(socket);
    });
    socket.on('message:all', () => {
      this.handleMessageAll(socket);
    });
    socket.on('message:send', (data) => {
      this.handleMessageSend(socket, data);
    });
    socket.on('message:update', (data) => {
      this.handleMessageUpdate(socket, data);
    });
  }

  private async handleUserJoin(
    socket: Socket,
    data: { id: string; name: string; uuid: string }
  ): Promise<void> {
    console.log('User joined', data);

    const user = this.userService.getUserBySocketId(socket.id);
    if (user?.name) {
      console.log('Client already joined', user.name);
      return;
    }

    this.userService.setUserName(socket.id, data.name, data.uuid);

    const messages = await this.messagesService.getAllMessages();
    const users = this.userService.getAllUsers();

    socket.emit('message:all', messages);
    socket.emit('user:all', users);
    socket.broadcast.emit('user:join', data);
  }

  private handleUserLeave(socket: Socket) {
    console.log('all users', this.userService.getAllUsers());
    this.userService.removeUser(socket.id);
    socket.broadcast.emit('user:leave', socket.id);
    console.log('User left', socket.id);
  }

  private async handleUserAll(socket: Socket): Promise<void> {
    const users = this.userService.getAllUsers();
    console.log('User all', users);
    socket.emit('user:all', users);
  }

  private async handleMessageAll(socket: Socket): Promise<void> {
    const messages = await this.messagesService.getAllMessages();
    socket.emit('message:all', messages);
  }

  private async handleMessageSend(
    socket: Socket,
    data: {
      senderName: string;
      text: string;
      type?: string;
      sender?: MessageSender;
      clientMsgId: number;
      senderId?: string;
      id: string;
    }
  ): Promise<void> {
    const savedMessage = await this.messagesService.saveMessage({
      senderName: data.senderName,
      text: data.text,
      type: data.type,
      senderType: data.sender || 'USER',
      senderId: data.senderId,
      id: data.id
    });

    socket.broadcast.emit('message:new', savedMessage);
    await this.processBotMessage(savedMessage);
  }

  private async handleMessageUpdate(
    socket: Socket,
    data: { id: string; text: string }
  ): Promise<void> {
    const updatedMessages = await this.messagesService.updateMessage(data.id, data.text);
    socket.broadcast.emit('message:all', updatedMessages);
  }

  private async processBotMessage(message: ChatMessage) {
    const botResponse = await this.botService.processMessage(message);

    if (botResponse.isAnswerForPastQuestion && botResponse.message) {
      const botMessage: ChatMessage = {
        senderName: 'Bot',
        text: botResponse.message,
        senderType: 'BOT',
        senderId: 'bot',
        id: crypto.randomUUID(),
        createdAt: new Date(),
        type: 'text'
      };
      this.socketServer.emit('message:new', botMessage);
    }
  }

  private startFunnyMessageTimer(): void {
    this.funnyMessageInterval = setInterval(async () => {
      try {
        const funnyMessage = await this.botService.generateFunnyMessage();
        if (funnyMessage) {
          const botMessage = await this.messagesService.saveMessage({
            senderName: 'Bot',
            text: funnyMessage,
            senderType: 'BOT',
            senderId: 'bot',
            id: '',
          });
          this.socketServer.emit('message:new', botMessage);
        }
      } catch (error) {
        console.error('Error sending funny message:', error);
      }
    }, 60000);
  }

  async close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.funnyMessageInterval) {
        clearInterval(this.funnyMessageInterval);
        this.funnyMessageInterval = null;
      }

      this.socketServer.close(() => {
        console.log('Chat Socket.IO server closed');
        resolve();
      });
    });
  }
}