import { DatabaseService, ChatMessage } from './database-service';

export interface MessageData {
  senderName: string;
  text: string;
  type?: string;
  senderType?: 'USER' | 'BOT';
  senderId: string;
  id: string
}

export class MessagesService {
  constructor(private readonly database: DatabaseService) {}

  async getAllMessages(): Promise<ChatMessage[]> {
    return this.database.getAllMessages();
  }

  async saveMessage(messageData: MessageData): Promise<ChatMessage> {
    const message: ChatMessage = {
      senderName: messageData.senderName,
      text: messageData.text,
      type: messageData.type as 'text' | 'image' || 'text',
      senderType: messageData.senderType || 'USER',
      createdAt: new Date(),
      senderId: messageData.senderId,
      id: messageData.id
    };

    return this.database.addMessage(message);
  }

  async updateMessage(id: string, text: string): Promise<ChatMessage[]> {
    return this.database.UpdateMessage(id, text);
  }
}