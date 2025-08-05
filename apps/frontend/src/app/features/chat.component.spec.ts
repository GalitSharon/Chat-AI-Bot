import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChatComponent } from './chat.component';
import { UsersService } from '../core/services/users/users.service';
import { MessagesService } from '../core/services/messages/messages.service';
import { User } from '../core/models/user.model';
import { Message } from '../core/models/message.model';
import { UserOnboardingDialogComponent } from './chat/user-onboarding-dialog/user-onboarding-dialog.component';
import { UsersPanelComponent } from './chat/users-panel/users-panel.component';
import { MessagesPanelComponent } from './chat/messages-panel/messages-panel.component';
import { InputBarComponent } from './chat/messages-panel/input-bar/input-bar.component';


@Component({
  selector: 'app-user-onboarding-dialog',
  template: '<div></div>',
  standalone: true
})
class MockUserOnboardingDialogComponent {
  @Output() completed = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  open() {
}
}

@Component({
  selector: 'app-users-panel',
  template: '<div></div>',
  standalone: true
})
class MockUsersPanelComponent {
  @Input() users: User[] | null = null;
  @Input() currentUserId: string | null = null;
}

@Component({
  selector: 'app-messages-panel',
  template: '<div></div>',
  standalone: true
})
class MockMessagesPanelComponent {
  @Input() messages: Message[] | null = null;
  @Input() currentUserId: string | null = null;
  @Output() messageSend = new EventEmitter<string>();
  @Output() messageUpdated = new EventEmitter<{ id: string; text: string }>();
}

@Component({
  selector: 'app-input-bar',
  template: '<div></div>',
  standalone: true
})
class MockInputBarComponent {
  @Output() messageSend = new EventEmitter<string>();
}

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let mockUsersService: Partial<UsersService>;
  let mockMessagesService: Partial<MessagesService>;
  let usersSubject: BehaviorSubject<User[]>;
  let messagesSubject: BehaviorSubject<Message[]>;
  const meUserSignal = signal<User | null>(null);

  const mockUser: User = {
    id: 'test-user-id',
    name: 'Test User'
  };

  const mockMessage: Message = {
    id: 'test-message-id',
    text: 'Test message',
    senderName: 'Test User',
    senderId: 'test-user-id',
    senderType: 'USER',
    createdAt: new Date().toISOString()
  };

  beforeEach(async () => {
    usersSubject = new BehaviorSubject<User[]>([]);
    messagesSubject = new BehaviorSubject<Message[]>([]);

    meUserSignal.set(null);


    mockUsersService = {
      users$: usersSubject.asObservable(),
      meUser: meUserSignal,
      initUserFromStorage: jest.fn(),
      userJoin: jest.fn(),
      setMeUser: jest.fn()
    };

    mockMessagesService = {
      messages$: messagesSubject.asObservable(),
      sendMessage: jest.fn(),
      updateMessage: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        ChatComponent,
        MockUserOnboardingDialogComponent,
        MockUsersPanelComponent,
        MockMessagesPanelComponent,
        MockInputBarComponent
      ],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: MessagesService, useValue: mockMessagesService }
      ]
    })
    .overrideComponent(ChatComponent, {
      remove: {
        imports: [
          UserOnboardingDialogComponent,
          UsersPanelComponent,
          MessagesPanelComponent,
          InputBarComponent
        ],
        providers: [UsersService, MessagesService]
      },
      add: {
        imports: [
          MockUserOnboardingDialogComponent,
          MockUsersPanelComponent,
          MockMessagesPanelComponent,
          MockInputBarComponent
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;


    (component as any)['usersService'] = mockUsersService;
    (component as any)['messagesService'] = mockMessagesService;


    fixture.detectChanges();
  });

  afterEach(() => {
    usersSubject.complete();
    messagesSubject.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize users$ observable from UsersService', () => {
    const testUsers = [mockUser];
    usersSubject.next(testUsers);

    component.users$.subscribe(users => {
      expect(users).toEqual(testUsers);
    });
  });

  it('should initialize messages$ observable from MessagesService', () => {
    const testMessages = [mockMessage];
    messagesSubject.next(testMessages);

    component.messages$.subscribe(messages => {
      expect(messages).toEqual(testMessages);
    });
  });

});
