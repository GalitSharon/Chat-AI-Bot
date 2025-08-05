import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserDisplayComponent } from '../../users-panel/user-display/user-display.component';
import { Message } from '../../../../core/models/message.model';

@Component({
  selector: 'app-message-item',
  imports: [CommonModule, UserDisplayComponent, FormsModule],
  templateUrl: './message-item.component.html',
  styleUrl: './message-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageItemComponent {
  @Input() message!: Message;
  @Input() currentUserId: string | null = null;
  @Output() messageUpdate = new EventEmitter<{ id: string; text: string }>();

  isEditing = false;
  editingText = '';

  isMyMessage(message: Message): boolean {
    return this.currentUserId === message.senderId;
  }

  isBotMessage(message: Message): boolean {
    return message.senderType === 'BOT';
  }

  isOtherUserMessage(message: Message): boolean {
    return !this.isMyMessage(message) && !this.isBotMessage(message);
  }

  formatTime(timestamp: string | undefined): string {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return (
        date.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
        ' ' +
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    }
  }

  onEditMessage(): void {
    this.isEditing = true;
    this.editingText = this.message.text;
  }

  onSaveEdit(): void {
    if (this.editingText.trim() !== '') {
      this.messageUpdate.emit({
        id: this.message.id as string,
        text: this.editingText.trim(),
      });
    }
    this.cancelEdit();
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editingText = '';
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSaveEdit();
    } else if (event.key === 'Escape') {
      this.cancelEdit();
    }
  }
}
