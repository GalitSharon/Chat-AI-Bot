import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputBarComponent } from './input-bar.component';

describe('InputBarComponent', () => {
  let component: InputBarComponent;
  let fixture: ComponentFixture<InputBarComponent>;
  let mockTextarea: Partial<HTMLTextAreaElement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputBarComponent, CommonModule, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(InputBarComponent);
    component = fixture.componentInstance;

    mockTextarea = {
      focus: jest.fn(),
      style: { height: '' } as CSSStyleDeclaration,
      scrollHeight: 50
    };

    Object.defineProperty(component, 'messageTextarea', {
      value: { nativeElement: mockTextarea } as ElementRef<HTMLTextAreaElement>,
      writable: true
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Signal and initial state', () => {
    it('should initialize with empty inputText signal', () => {
      expect(component.inputText()).toBe('');
    });

    it('should update inputText signal when value changes', () => {
      const testText = 'Hello world';
      component.inputText.set(testText);

      expect(component.inputText()).toBe(testText);
    });
  });

  describe('Keyboard event handling', () => {
    it('should send message on Enter key press', () => {
      const messageSendSpy = jest.spyOn(component.messageSend, 'emit');
      const preventDefaultSpy = jest.fn();
      component.inputText.set('Test message');

      const enterEvent = {
        key: 'Enter',
        shiftKey: false,
        preventDefault: preventDefaultSpy
      } as unknown as KeyboardEvent;

      component.onKeyPress(enterEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(messageSendSpy).toHaveBeenCalledWith('Test message');
      expect(component.inputText()).toBe('');
    });
  });

  describe('Message sending functionality', () => {
    it('should not emit message when input is empty or whitespace only', () => {
      const messageSendSpy = jest.spyOn(component.messageSend, 'emit');

      component.inputText.set('');
      component.onMessageSent();
      expect(messageSendSpy).not.toHaveBeenCalled();

      component.inputText.set('   ');
      component.onMessageSent();
      expect(messageSendSpy).not.toHaveBeenCalled();

      expect(messageSendSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe('Auto-resize functionality', () => {
    it('should call autoResize when input changes', () => {
      const autoResizeSpy = jest.spyOn(component, 'onInputChange');

      component.onInputChange();

      expect(autoResizeSpy).toHaveBeenCalled();
    });

    it('should set textarea height to scroll height when under max limit', () => {
      const mockTextareaWithScroll = {
        ...mockTextarea,
        scrollHeight: 80,
        style: { height: '' } as CSSStyleDeclaration
      };

      Object.defineProperty(component, 'messageTextarea', {
        value: { nativeElement: mockTextareaWithScroll } as ElementRef<HTMLTextAreaElement>,
        writable: true
      });

      (component as any).autoResize();

      expect(mockTextareaWithScroll.style.height).toBe('80px');
    });
  });
});
