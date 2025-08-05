import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-onboarding-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './user-onboarding-dialog.component.html',
  styleUrls: ['./user-onboarding-dialog.component.scss'],
})
export class UserOnboardingDialogComponent {
  @Output() completed = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();
  @ViewChild('dlg', { static: true }) dlg!: ElementRef<HTMLDialogElement>;
  @ViewChild('nameInput', { static: true })
  nameInput!: ElementRef<HTMLInputElement>;

  name = '';

  open() {
    this.name = '';
    this.dlg.nativeElement.showModal();

    setTimeout(() => {
      this.nameInput.nativeElement.focus();
    }, 100);

    this.dlg.nativeElement.addEventListener('cancel', (event) => {
      event.preventDefault();
      this.cancel();
    });

    this.dlg.nativeElement.addEventListener('click', (event) => {
      if (event.target === this.dlg.nativeElement) {
        this.cancel();
      }
    });
  }

  submit() {
    const trimmedName = this.name.trim();
    if (!trimmedName) return;

    this.close();
    this.completed.emit(trimmedName);
  }

  cancel() {
    this.close();
    this.cancelled.emit();
  }

  private close() {
    this.dlg.nativeElement.close();
  }
}
