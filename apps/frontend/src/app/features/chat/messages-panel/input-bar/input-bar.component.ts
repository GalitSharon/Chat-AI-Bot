import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-bar',
  imports: [CommonModule, FormsModule],
  templateUrl: './input-bar.component.html',
  styleUrl: './input-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputBarComponent implements AfterViewInit {
  inputText = signal('');

  @Output() messageSend = new EventEmitter<string>();
  @ViewChild('messageTextarea')
  messageTextarea!: ElementRef<HTMLTextAreaElement>;

  ngAfterViewInit() {
    this.messageTextarea.nativeElement.focus();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onMessageSent();
    }
  }

  onMessageSent(): void {
    const message = this.inputText().trim();
    if (message) {
      this.messageSend.emit(message);
      this.inputText.set('');
      this.autoResize();
      this.messageTextarea.nativeElement.focus();
    }
  }

  onInputChange(): void {
    this.autoResize();
  }

  private autoResize(): void {
    const textarea = this.messageTextarea.nativeElement;
    textarea.style.height = 'auto';
    const maxHeight = 120;
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px';
  }
}
