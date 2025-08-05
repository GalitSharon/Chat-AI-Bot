import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersPanelComponent } from './users-panel.component';
import { User } from '../../../core/models/user.model';

describe('UsersPanelComponent', () => {
  let component: UsersPanelComponent;
  let fixture: ComponentFixture<UsersPanelComponent>;

  const mockUsers: User[] = [
    { id: '1', name: 'Alice', uuid: '2' },
    { id: '2', name: 'Bob', uuid: '3' },
    { id: '3', name: 'Charlie', uuid: '4' },
    { id: '1', name: 'Alice', uuid: '2' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersPanelComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UsersPanelComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should separate users correctly when currentUserId matches an existing user', () => {
    component.users = mockUsers;
    component.currentUserId = '2';

    component.ngOnChanges();

    expect(component.meUser).toEqual({ id: '2', name: 'Bob' });
    expect(component.otherUsers).toHaveLength(2);
    expect(component.otherUsers).toContainEqual({ id: '1', name: 'Alice' });
    expect(component.otherUsers).toContainEqual({ id: '3', name: 'Charlie' });
    expect(component.otherUsers).not.toContainEqual({ id: '2', name: 'Bob' });
  });

  it('should find current user from localStorage when currentUserId is not found in users array', () => {
    localStorage.setItem('meUser', JSON.stringify({ name: 'Alice' }));
    component.users = mockUsers;
    component.currentUserId = 'non-existent-id';

    component.ngOnChanges();

    expect(component.meUser).toEqual({ id: '1', name: 'Alice' });
    expect(component.otherUsers).toHaveLength(2);
    expect(component.otherUsers).not.toContain(component.meUser);
  });

});
