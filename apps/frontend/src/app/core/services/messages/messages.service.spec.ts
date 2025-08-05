import { TestBed } from '@angular/core/testing';
import { MessagesService } from './messages.service';
import { SocketService } from '../socket/socket.service';
import { UsersService } from '../users/users.service';
import { Message } from '../../models/message.model';
import { User } from '../../models/user.model';

describe('MessagesService', () => {
  let service: MessagesService;
  let socketServiceSpy: jest.Mocked<SocketService>;
  let usersServiceSpy: jest.Mocked<UsersService>;

  const mockUser: User = {
    id: 'user-123',
    name: 'John Doe'
  };

  const mockMessage: Message = {
    id: 'msg-123',
    text: 'Hello world',
    senderName: 'John Doe',
    senderId: 'user-123',
    senderType: 'USER',
    createdAt: '2023-01-01T00:00:00.000Z'
  };

  beforeEach(() => {
    const socketSpy = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      ngOnDestroy: jest.fn()
    } as unknown as jest.Mocked<SocketService>;

    const usersSpy = {
      meUser: jest.fn().mockReturnValue(mockUser),
      users$: jest.fn(),
      initUserFromStorage: jest.fn(),
      addUser: jest.fn(),
      removeUser: jest.fn(),
      joinUser: jest.fn(),
      leaveUser: jest.fn(),
      ngOnDestroy: jest.fn()
    } as unknown as jest.Mocked<UsersService>;

    TestBed.configureTestingModule({
      providers: [
        MessagesService,
        { provide: SocketService, useValue: socketSpy },
        { provide: UsersService, useValue: usersSpy }
      ]
    });

    service = TestBed.inject(MessagesService);
    socketServiceSpy = TestBed.inject(SocketService) as jest.Mocked<SocketService>;
    usersServiceSpy = TestBed.inject(UsersService) as jest.Mocked<UsersService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialization', () => {
    it('should initialize socket listeners', () => {
      expect(socketServiceSpy.on).toHaveBeenCalledWith('message:new', expect.any(Function));
      expect(socketServiceSpy.on).toHaveBeenCalledWith('message:all', expect.any(Function));
    });

    it('should have an empty messages array initially', (done) => {
      service.messages$.subscribe(messages => {
        expect(messages).toEqual([]);
        done();
      });
    });
  });

  describe('addMessage', () => {
    it('should add a message to the messages array', (done) => {
      service.addMessage(mockMessage);

      service.messages$.subscribe(messages => {
        expect(messages).toContain(mockMessage);
        expect(messages.length).toBe(1);
        done();
      });
    });

    it('should maintain existing messages when adding a new one', (done) => {
      const secondMessage: Message = {
        ...mockMessage,
        id: 'msg-456',
        text: 'Second message'
      };

      service.addMessage(mockMessage);
      service.addMessage(secondMessage);

      service.messages$.subscribe(messages => {
        expect(messages.length).toBe(2);
        expect(messages).toContain(mockMessage);
        expect(messages).toContain(secondMessage);
        done();
      });
    });
  });

  describe('sendMessage', () => {
    beforeEach(() => {
      // Mock crypto.randomUUID
      Object.defineProperty(global, 'crypto', {
        value: {
          randomUUID: jest.fn().mockReturnValue('550e8400-e29b-41d4-a716-446655440000')
        },
        writable: true
      });
      // Mock Date
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-01-01T00:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should send a message when user is available', (done) => {
      const inputText = 'Hello world';

      service.sendMessage(inputText);

      service.messages$.subscribe(messages => {
        expect(messages.length).toBe(1);
        const sentMessage = messages[0];
        expect(sentMessage.id).toBe('550e8400-e29b-41d4-a716-446655440000');
        expect(sentMessage.text).toBe(inputText);
        expect(sentMessage.senderName).toBe(mockUser.name);
        expect(sentMessage.senderId).toBe(mockUser.id);
        expect(sentMessage.senderType).toBe('USER');
        expect(sentMessage.createdAt).toBe('2023-01-01T00:00:00.000Z');
        done();
      });

      expect(socketServiceSpy.emit).toHaveBeenCalledWith('message:send', expect.objectContaining({
        id: '550e8400-e29b-41d4-a716-446655440000',
        text: inputText,
        senderName: mockUser.name,
        senderId: mockUser.id,
        senderType: 'USER',
        createdAt: '2023-01-01T00:00:00.000Z'
      }));
    });

    it('should not send empty message', () => {
      service.sendMessage('   ');

      service.messages$.subscribe(messages => {
        expect(messages.length).toBe(0);
      });

      expect(socketServiceSpy.emit).not.toHaveBeenCalled();
    });

    it('should not send message when user is not available', () => {
      usersServiceSpy.meUser.mockReturnValue(null);

      service.sendMessage('Hello world');

      service.messages$.subscribe(messages => {
        expect(messages.length).toBe(0);
      });

      expect(socketServiceSpy.emit).not.toHaveBeenCalled();
    });

    it('should trim whitespace from input text', (done) => {
      const inputText = '  Hello world  ';

      service.sendMessage(inputText);

      service.messages$.subscribe(messages => {
        expect(messages[0].text).toBe('Hello world');
        done();
      });
    });
  });

  describe('updateMessage', () => {
    beforeEach(() => {
      service.addMessage(mockMessage);
    });

    it('should update message text', (done) => {
      const newText = 'Updated message';
      const messageId = mockMessage.id || 'msg-123';

      service.updateMessage(messageId, newText);

      service.messages$.subscribe(messages => {
        const updatedMessage = messages.find(msg => msg.id === messageId);
        expect(updatedMessage?.text).toBe(newText);
        done();
      });
    });

    it('should emit socket event when updating message', () => {
      const newText = 'Updated message';
      const messageId = mockMessage.id || 'msg-123';

      service.updateMessage(messageId, newText);

      expect(socketServiceSpy.emit).toHaveBeenCalledWith('message:update', {
        id: messageId,
        text: newText
      });
    });

    it('should not update non-existent message', (done) => {
      const originalText = mockMessage.text;

      service.updateMessage('non-existent-id', 'New text');

      service.messages$.subscribe(messages => {
        const message = messages.find(msg => msg.id === mockMessage.id);
        expect(message?.text).toBe(originalText);
        done();
      });
    });

    it('should update multiple messages with same id', (done) => {
      const duplicateMessage: Message = { ...mockMessage };
      service.addMessage(duplicateMessage);
      const newText = 'Updated text';
      const messageId = mockMessage.id || 'msg-123';

      service.updateMessage(messageId, newText);

      service.messages$.subscribe(messages => {
        const updatedMessages = messages.filter(msg => msg.id === messageId);
        updatedMessages.forEach(msg => {
          expect(msg.text).toBe(newText);
        });
        done();
      });
    });
  });

  describe('socket event handlers', () => {
    let messageNewHandler: ((message: Message) => void) | undefined;
    let messageAllHandler: ((messages: Message[]) => void) | undefined;

    beforeEach(() => {
      // Extract the handlers from the spy calls
      const onCalls = socketServiceSpy.on.mock.calls;
      messageNewHandler = onCalls.find(call => call[0] === 'message:new')?.[1] as ((message: Message) => void) | undefined;
      messageAllHandler = onCalls.find(call => call[0] === 'message:all')?.[1] as ((messages: Message[]) => void) | undefined;
    });

    it('should handle new message event', (done) => {
      const newMessage: Message = {
        id: 'new-msg',
        text: 'New message',
        senderName: 'Jane',
        senderId: 'user-456',
        senderType: 'USER',
        createdAt: '2023-01-01T01:00:00.000Z'
      };

      messageNewHandler?.(newMessage);

      service.messages$.subscribe(messages => {
        expect(messages).toContain(newMessage);
        done();
      });
    });

    it('should handle all messages event', (done) => {
      const allMessages: Message[] = [
        mockMessage,
        {
          id: 'msg-789',
          text: 'Another message',
          senderName: 'Alice',
          senderId: 'user-789',
          senderType: 'BOT',
          createdAt: '2023-01-01T02:00:00.000Z'
        }
      ];

      messageAllHandler?.(allMessages);

      service.messages$.subscribe(messages => {
        expect(messages).toEqual(allMessages);
        done();
      });
    });

    it('should append new message to existing messages', (done) => {
      service.addMessage(mockMessage);

      const newMessage: Message = {
        id: 'new-msg',
        text: 'New message',
        senderName: 'Jane',
        senderId: 'user-456',
        senderType: 'USER',
        createdAt: '2023-01-01T01:00:00.000Z'
      };

      messageNewHandler?.(newMessage);

      service.messages$.subscribe(messages => {
        expect(messages.length).toBe(2);
        expect(messages).toContain(mockMessage);
        expect(messages).toContain(newMessage);
        done();
      });
    });
  });

  describe('ngOnDestroy', () => {
    it('should remove socket listeners and complete subject', () => {
      const completeSpy = jest.spyOn(service['messagesSubject'], 'complete');

      service.ngOnDestroy();

      expect(socketServiceSpy.off).toHaveBeenCalledWith('message:new', expect.any(Function));
      expect(socketServiceSpy.off).toHaveBeenCalledWith('message:all', expect.any(Function));
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
