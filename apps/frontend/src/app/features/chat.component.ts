import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { UserOnboardingDialogComponent } from './chat/user-onboarding-dialog/user-onboarding-dialog.component';
import { UsersPanelComponent } from './chat/users-panel/users-panel.component';
import { MessagesPanelComponent } from './chat/messages-panel/messages-panel.component';
import { UsersService } from '../core/services/users/users.service';
import { MessagesService } from '../core/services/messages/messages.service';
import { InputBarComponent } from './chat/messages-panel/input-bar/input-bar.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    FormsModule,
    UserOnboardingDialogComponent,
    UsersPanelComponent,
    MessagesPanelComponent,
    AsyncPipe,
    InputBarComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  providers: [UsersService, MessagesService],
})
export class ChatComponent implements AfterViewInit {
  private usersService = inject(UsersService);
  users$ = this.usersService.users$;

  private messagesService = inject(MessagesService);
  messages$ = this.messagesService.messages$;

  @ViewChild(UserOnboardingDialogComponent)
  userDialog!: UserOnboardingDialogComponent;

  get currentUserId(): string | null {
    return this.usersService.meUser()?.id || null;
  }

  ngAfterViewInit() {
    this.usersService.initUserFromStorage();
    const meUser = this.usersService.meUser();
    if (!meUser) {
      this.userDialog.open();
    } else {
      this.usersService.userJoin(meUser);
    }
  }

  onNameCompleted(inputName: string) {
    const name = inputName.trim();
    if (name) {
      const uuid = crypto.randomUUID();
      this.usersService.setMeUser({
        id: uuid,
        name: name,
        uuid: uuid,
      });
    }
  }

  onMessageSend(text: string) {
    this.messagesService.sendMessage(text);
  }

  onMessageUpdated(event: { id: string; text: string }) {
    this.messagesService.updateMessage(event.id, event.text);
  }
}
