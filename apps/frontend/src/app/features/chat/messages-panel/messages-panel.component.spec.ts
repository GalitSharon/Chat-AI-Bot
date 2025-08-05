import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, ElementRef } from '@angular/core';
import { MessagesPanelComponent } from './messages-panel.component';
import { MessageItemComponent } from './message-item/message-item.component';
import { Message } from '../../../core/models/message.model';
import { SenderType } from '../../../core/models/sender-type.model';

@Component({
  selector: 'app-message-item',
  template: '<div></div>',
  standalone: true
})
class MockMessageItemComponent {
  message: Message = {} as Message;
  currentUserId: string | null = null;
  messageUpdate = new EventEmitter<{ id: string; text: string }>();
}

describe('MessagesPanelComponent', () => {
  let component: MessagesPanelComponent;
  let fixture: ComponentFixture<MessagesPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessagesPanelComponent, CommonModule, MockMessageItemComponent]
    })
      .overrideComponent(MessagesPanelComponent, {
        remove: { imports: [MessageItemComponent] },
        add: { imports: [CommonModule, MockMessageItemComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(MessagesPanelComponent);
    component = fixture.componentInstance;

    const mockScrollElement = {
      nativeElement: {
        scrollTop: 0,
        scrollHeight: 500
      }
    } as ElementRef<HTMLElement>;

    Object.defineProperty(component, 'messagesContainer', {
      value: mockScrollElement,
      writable: true
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input properties', () => {
    it('should accept messages input', () => {
      const testMessages: Message[] = [
        {
          id: '1',
          text: 'Hello',
          senderName: 'User1',
          senderId: 'user1',
          senderType: 'USER' as SenderType
        },
        {
          id: '2',
          text: 'Hi there',
          senderName: 'User2',
          senderId: 'user2',
          senderType: 'USER' as SenderType
        }
      ];

      component.messages = testMessages;
      expect(component.messages).toEqual(testMessages);
      expect(component.messages.length).toBe(2);
    });
  });

  describe('Output events', () => {
    it('should emit messageUpdate when onMessageUpdates is called', () => {
      const emitSpy = jest.spyOn(component.messageUpdate, 'emit');
      const testEvent = { id: 'msg1', text: 'Updated message' };

      component.onMessageUpdates(testEvent);

      expect(emitSpy).toHaveBeenCalledWith(testEvent);
    });
  });

  describe('Message handling', () => {
    it('should handle message updates from child components', () => {
      const emitSpy = jest.spyOn(component.messageUpdate, 'emit');
      const updateEvent = { id: 'test-id', text: 'updated text' };

      component.onMessageUpdates(updateEvent);

      expect(emitSpy).toHaveBeenCalledWith(updateEvent);
    });

    it('should handle multiple message updates', () => {
      const emitSpy = jest.spyOn(component.messageUpdate, 'emit');
      const updates = [
        { id: 'msg1', text: 'first update' },
        { id: 'msg2', text: 'second update' }
      ];

      updates.forEach(update => component.onMessageUpdates(update));

      expect(emitSpy).toHaveBeenCalledTimes(2);
      expect(emitSpy).toHaveBeenNthCalledWith(1, updates[0]);
      expect(emitSpy).toHaveBeenNthCalledWith(2, updates[1]);
    });
  });

  describe('Scroll behavior', () => {
    it('should call scrollToBottom when ngAfterViewChecked is triggered', () => {
      const scrollToBottomSpy = jest.spyOn(component as any, 'scrollToBottom');

      component.ngAfterViewChecked();

      expect(scrollToBottomSpy).toHaveBeenCalled();
    });

  })

})