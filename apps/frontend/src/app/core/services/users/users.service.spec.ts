import { TestBed } from '@angular/core/testing';
import { UsersService } from './users.service';
import { SocketService } from '../socket/socket.service';
import { User } from '../../models/user.model';

describe('UsersService', () => {
  let service: UsersService;
  let socketServiceMock: jest.Mocked<SocketService>;

  // Mock user data for testing
  const mockUser1: User = {
    id: '1',
    name: 'John Doe'
  };

  const mockUser2: User = {
    id: '2',
    name: 'Jane Smith'
  };

  const mockUser3: User = {
    id: '3',
    name: 'Bob Johnson'
  };

  beforeEach(() => {
    // Create spy object for SocketService
    socketServiceMock = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      ngOnDestroy: jest.fn()
    } as unknown as jest.Mocked<SocketService>;

    TestBed.configureTestingModule({
      providers: [
        UsersService,
        { provide: SocketService, useValue: socketServiceMock }
      ]
    });

    // Clear localStorage before each test
    localStorage.clear();

    service = TestBed.inject(UsersService);
  });

  afterEach(() => {
    // Clean up localStorage after each test
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Constructor and Initialization', () => {
    it('should initialize socket listeners on construction', () => {
      expect(socketServiceMock.on).toHaveBeenCalledWith('user:all', expect.any(Function));
      expect(socketServiceMock.on).toHaveBeenCalledWith('user:join', expect.any(Function));
      expect(socketServiceMock.on).toHaveBeenCalledWith('user:leave', expect.any(Function));
      expect(socketServiceMock.on).toHaveBeenCalledTimes(3);
    });

    it('should initialize with empty users array', (done) => {
      service.users$.subscribe(users => {
        expect(users).toEqual([]);
        done();
      });
    });

    it('should initialize with null meUser', () => {
      expect(service.meUser()).toBeNull();
    });
  });

  describe('initUserFromStorage', () => {
    it('should set meUser from localStorage when data exists', () => {
      // Arrange
      localStorage.setItem('meUser', JSON.stringify(mockUser1));

      // Act
      service.initUserFromStorage();

      // Assert
      expect(service.meUser()).toEqual(mockUser1);
    });

    it('should not change meUser when localStorage is empty', () => {
      // Act
      service.initUserFromStorage();

      // Assert
      expect(service.meUser()).toBeNull();
    });

    it('should handle invalid JSON in localStorage gracefully', () => {
      // Arrange
      localStorage.setItem('meUser', 'invalid-json');

      // Act & Assert
      expect(() => service.initUserFromStorage()).toThrow();
    });
  });

  describe('addUser', () => {
    it('should add user to the users list', (done) => {
      // Act
      service.addUser(mockUser1);

      // Assert
      service.users$.subscribe(users => {
        expect(users).toEqual([mockUser1]);
        done();
      });
    });

    it('should add multiple users to the list', (done) => {
      // Act
      service.addUser(mockUser1);
      service.addUser(mockUser2);

      // Assert
      service.users$.subscribe(users => {
        expect(users).toEqual([mockUser1, mockUser2]);
        done();
      });
    });
  });

  describe('removeUser', () => {
    beforeEach(() => {
      service.addUser(mockUser1);
      service.addUser(mockUser2);
      service.addUser(mockUser3);
    });

    it('should remove user by id', (done) => {
      // Act
      service.removeUser('2');

      // Assert
      service.users$.subscribe(users => {
        expect(users).toEqual([mockUser1, mockUser3]);
        expect(users.find(u => u.id === '2')).toBeUndefined();
        done();
      });
    });

    it('should not affect list when removing non-existent user', (done) => {
      // Act
      service.removeUser('non-existent');

      // Assert
      service.users$.subscribe(users => {
        expect(users).toEqual([mockUser1, mockUser2, mockUser3]);
        done();
      });
    });
  });

  describe('setMeUser', () => {
    it('should set meUser signal', () => {
      // Act
      service.setMeUser(mockUser1);

      // Assert
      expect(service.meUser()).toEqual(mockUser1);
    });

    it('should save meUser to localStorage', () => {
      // Act
      service.setMeUser(mockUser1);

      // Assert
      const storedUser = localStorage.getItem('meUser');
      expect(storedUser).toBe(JSON.stringify(mockUser1));
    });

    it('should add user to users list', (done) => {
      // Act
      service.setMeUser(mockUser1);

      // Assert
      service.users$.subscribe(users => {
        expect(users).toContain(mockUser1);
        done();
      });
    });

    it('should emit user:join event', () => {
      // Act
      service.setMeUser(mockUser1);

      // Assert
      expect(socketServiceMock.emit).toHaveBeenCalledWith('user:join', mockUser1);
    });
  });

  describe('userJoin', () => {
    it('should emit user:join event with user data', () => {
      // Act
      service.userJoin(mockUser1);

      // Assert
      expect(socketServiceMock.emit).toHaveBeenCalledWith('user:join', mockUser1);
    });
  });

  describe('Socket Event Handlers', () => {
    let userAllHandler: (users: User[]) => void;
    let userJoinHandler: (user: User) => void;
    let userLeaveHandler: (userId: string) => void;

    beforeEach(() => {
      // Extract the handlers that were registered
      const onCalls = (socketServiceMock.on as jest.Mock).mock.calls;
      userAllHandler = onCalls.find((call: any[]) => call[0] === 'user:all')?.[1];
      userJoinHandler = onCalls.find((call: any[]) => call[0] === 'user:join')?.[1];
      userLeaveHandler = onCalls.find((call: any[]) => call[0] === 'user:leave')?.[1];
    });

    describe('userAllHandler', () => {
      it('should update users list with all users', (done) => {
        // Arrange
        const allUsers = [mockUser1, mockUser2, mockUser3];

        // Act
        userAllHandler(allUsers);

        // Assert
        service.users$.subscribe(users => {
          expect(users).toEqual(allUsers);
          done();
        });
      });

      it('should replace existing users list', (done) => {
        // Arrange
        service.addUser(mockUser1);
        const newUsers = [mockUser2, mockUser3];

        // Act
        userAllHandler(newUsers);

        // Assert
        service.users$.subscribe(users => {
          expect(users).toEqual(newUsers);
          expect(users).not.toContain(mockUser1);
          done();
        });
      });
    });

    describe('userJoinHandler', () => {
      it('should add new user to the list', (done) => {
        // Act
        userJoinHandler(mockUser1);

        // Assert
        service.users$.subscribe(users => {
          expect(users).toContain(mockUser1);
          done();
        });
      });

      it('should replace existing user with same id', (done) => {
        // Arrange
        const updatedUser = { ...mockUser1, name: 'Updated Name' };
        service.addUser(mockUser1);
        service.addUser(mockUser2);

        // Act
        userJoinHandler(updatedUser);

        // Assert
        service.users$.subscribe(users => {
          expect(users.length).toBe(2);
          expect(users.find(u => u.id === '1')).toEqual(updatedUser);
          expect(users.find(u => u.id === '1')?.name).toBe('Updated Name');
          done();
        });
      });
    });

    describe('userLeaveHandler', () => {
      beforeEach(() => {
        service.addUser(mockUser1);
        service.addUser(mockUser2);
        service.addUser(mockUser3);
      });

      it('should remove user by id', (done) => {
        // Act
        userLeaveHandler('2');

        // Assert
        service.users$.subscribe(users => {
          expect(users.find(u => u.id === '2')).toBeUndefined();
          expect(users).toEqual([mockUser1, mockUser3]);
          done();
        });
      });

      it('should not affect list when removing non-existent user', (done) => {
        // Act
        userLeaveHandler('non-existent');

        // Assert
        service.users$.subscribe(users => {
          expect(users).toEqual([mockUser1, mockUser2, mockUser3]);
          done();
        });
      });
    });
  });

  describe('ngOnDestroy', () => {
    it('should remove all socket listeners', () => {
      // Act
      service.ngOnDestroy();

      // Assert
      expect(socketServiceMock.off).toHaveBeenCalledWith('user:all', expect.any(Function));
      expect(socketServiceMock.off).toHaveBeenCalledWith('user:join', expect.any(Function));
      expect(socketServiceMock.off).toHaveBeenCalledWith('user:leave', expect.any(Function));
      expect(socketServiceMock.off).toHaveBeenCalledTimes(3);
    });

    it('should complete the users subject', () => {
      // Arrange
      jest.spyOn(service['usersSubject'], 'complete');

      // Act
      service.ngOnDestroy();

      // Assert
      expect(service['usersSubject'].complete).toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete user workflow', (done) => {
      // Arrange
      const onCalls = (socketServiceMock.on as jest.Mock).mock.calls;
      const userJoinHandler = onCalls.find((call: any[]) => call[0] === 'user:join')?.[1];
      const userLeaveHandler = onCalls.find((call: any[]) => call[0] === 'user:leave')?.[1];

      let subscriptionCount = 0;
      const expectedStates = [
        [], // initial state
        [mockUser1], // after setMeUser
        [mockUser1, mockUser2], // after user join
        [mockUser1] // after user leave
      ];

      // Act & Assert
      service.users$.subscribe(users => {
        expect(users).toEqual(expectedStates[subscriptionCount]);
        subscriptionCount++;

        if (subscriptionCount === 4) {
          done();
        }
      });

      // Simulate user workflow
      setTimeout(() => service.setMeUser(mockUser1), 0);
      setTimeout(() => userJoinHandler(mockUser2), 10);
      setTimeout(() => userLeaveHandler('2'), 20);
    });
  });
});
