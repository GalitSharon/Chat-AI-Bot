import { SenderType } from './sender-type.model';

export type Message = {
  id?: string;
  text: string;
  senderName?: string;
  senderId?: string;
  senderType?: SenderType;
  createdAt?: string;
};
