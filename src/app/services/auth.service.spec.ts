import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { User } from '../models/user.model';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('AuthService - updateCurrentUser', () => {
  let authService: AuthService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: 1,
    username: 'pharmacist_1',
    email: 'pharmacist@hospital.local',
    role: 'PHARMACIAN',
    active: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, ApiService]
    });

    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('updateCurrentUser', () => {
    it('should make PUT request to /users with updates', async () => {
      const updates = { email: 'newemail@hospital.local' };

      authService.updateCurrentUser(updates).subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/v0/users');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updates);
      req.flush({ data: mockUser });
    });

    it('should update currentUserSignal on success', async () => {
      const updates = { email: 'updated@hospital.local' };
      const updatedUser: User = { ...mockUser, email: 'updated@hospital.local' };

      authService.updateCurrentUser(updates).subscribe(() => {
        expect(authService.currentUser()).toEqual(updatedUser);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/v0/users');
      req.flush({ data: updatedUser });
    });

    it('should save updated user to localStorage', async () => {
      const updates = { email: 'updated@hospital.local' };
      const updatedUser: User = { ...mockUser, email: 'updated@hospital.local' };

      const setItemSpy = vi.spyOn(localStorage, 'setItem');

      authService.updateCurrentUser(updates).subscribe(() => {
        expect(setItemSpy).toHaveBeenCalledWith('current_user', JSON.stringify(updatedUser));
      });

      const req = httpMock.expectOne('http://localhost:8080/api/v0/users');
      req.flush({ data: updatedUser });

      setItemSpy.mockRestore();
    });

    it('should handle 409 conflict error', () => {
      const updates = { email: 'duplicate@hospital.local' };

      authService.updateCurrentUser(updates).subscribe(
        () => {
          throw new Error('should have failed');
        },
        (error: any) => {
          expect(error.status).toBe(409);
        }
      );

      const req = httpMock.expectOne('http://localhost:8080/api/v0/users');
      req.flush({ msg: 'Email already exists' }, { status: 409, statusText: 'Conflict' });
    });

    it('should handle 400 validation error', () => {
      const updates = { email: 'invalid-email' };

      authService.updateCurrentUser(updates).subscribe(
        () => {
          throw new Error('should have failed');
        },
        (error: any) => {
          expect(error.status).toBe(400);
        }
      );

      const req = httpMock.expectOne('http://localhost:8080/api/v0/users');
      req.flush({ msg: 'Invalid email format' }, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle 404 user not found error', () => {
      const updates = { email: 'test@hospital.local' };

      authService.updateCurrentUser(updates).subscribe(
        () => {
          throw new Error('should have failed');
        },
        (error: any) => {
          expect(error.status).toBe(404);
        }
      );

      const req = httpMock.expectOne('http://localhost:8080/api/v0/users');
      req.flush({ msg: 'User not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getCurrentUser', () => {
    it('should fetch current user and update signal', () => {
      authService.getCurrentUser().subscribe((user) => {
        expect(user).toEqual(mockUser);
        expect(authService.currentUser()).toEqual(mockUser);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/v0/auth/currentuser');
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockUser });
    });
  });
});
