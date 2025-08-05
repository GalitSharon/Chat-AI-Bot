import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { EventEmitter, ElementRef } from '@angular/core';
import { UserOnboardingDialogComponent } from './user-onboarding-dialog.component';

describe('UserOnboardingDialogComponent', () => {
  let component: UserOnboardingDialogComponent;
  let fixture: ComponentFixture<UserOnboardingDialogComponent>;
  let mockDialogElement: jest.Mocked<HTMLDialogElement>;
  let mockInputElement: jest.Mocked<HTMLInputElement>;

  beforeEach(async () => {
    mockDialogElement = {
      showModal: jest.fn(),
      close: jest.fn(),
      addEventListener: jest.fn(),
    } as any;

    mockInputElement = {
      focus: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [UserOnboardingDialogComponent, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(UserOnboardingDialogComponent);
    component = fixture.componentInstance;

    component.dlg = { nativeElement: mockDialogElement } as ElementRef<HTMLDialogElement>;
    component.nameInput = { nativeElement: mockInputElement } as ElementRef<HTMLInputElement>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('open', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should reset name and open modal', () => {
      component.name = 'existing name';

      component.open();

      expect(component.name).toBe('');
      expect(mockDialogElement.showModal).toHaveBeenCalled();
    });

    it('should focus on name input after timeout', () => {
      component.open();

      jest.advanceTimersByTime(100);

      expect(mockInputElement.focus).toHaveBeenCalled();
    });

    it('should call cancel when cancel event is triggered', () => {
      const cancelSpy = jest.spyOn(component, 'cancel');
      let cancelListener: ((event: Event) => void) | undefined;

      mockDialogElement.addEventListener.mockImplementation((eventType: string, listener: any) => {
        if (eventType === 'cancel') {
          cancelListener = listener;
        }
      });

      component.open();

      const mockEvent = {
        preventDefault: jest.fn(),
        type: 'cancel',
        target: mockDialogElement,
        currentTarget: mockDialogElement,
        bubbles: false,
        cancelable: true
      } as any;

      if (cancelListener) {
        cancelListener(mockEvent);
      }

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(cancelSpy).toHaveBeenCalled();
    });
  });

  describe('submit', () => {

    it('should not emit or close when name is empty', () => {
      const emitSpy = jest.spyOn(component.completed, 'emit');
      component.name = '';

      component.submit();

      expect(mockDialogElement.close).not.toHaveBeenCalled();
      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should close dialog and emit cancelled event', () => {
      const emitSpy = jest.spyOn(component.cancelled, 'emit');

      component.cancel();

      expect(mockDialogElement.close).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalled();
    });
  });

});
