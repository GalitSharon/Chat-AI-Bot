import {
  AfterViewChecked,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../../core/models/message.model';
import { MessageItemComponent } from './message-item/message-item.component';

@Component({
  selector: 'app-messages-panel',
  imports: [CommonModule, MessageItemComponent],
  templateUrl: './messages-panel.component.html',
  styleUrl: './messages-panel.component.scss',
})
export class MessagesPanelComponent implements AfterViewChecked {
  @Input() messages: Message[] = [];
  @Input() currentUserId: string | null = null;
  @Output() messageUpdate = new EventEmitter<{ id: string; text: string }>();
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    if (this.messagesContainer ) {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    }
  }

  onMessageUpdates(event: { id: string; text: string }) {
    this.messageUpdate.emit(event);
  }
}
