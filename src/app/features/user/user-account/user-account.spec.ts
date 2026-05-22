import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserAccount } from './user-account';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { ApiService } from '../../../services/api.service';
import { User } from '../../../models/user.model';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('UserAccount Component', () => {
  let component: UserAccount;
  let fixture: ComponentFixture<UserAccount>;
  let mockAuthService: any;
  let mockToastService: any;

  const mockUser: User = {
    id: 1,
    username: 'pharmacist_1',
    email: 'pharmacist@hospital.local',
    role: 'PHARMACIAN',
    active: true,
    lastLogin: '2026-05-22T10:00:00Z'
  };

  beforeEach(async () => {
    mockAuthService = {
      currentUser: vi.fn(() => mockUser),
      getCurrentUser: vi.fn(() => of(mockUser)),
      updateCurrentUser: vi.fn(() => of(mockUser)),
      logout: vi.fn()
    };

    mockToastService = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [UserAccount, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToastService },
        ApiService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserAccount);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should display user initial in avatar', () => {
      expect(component.userInitial()).toBe('P');
    });

    it('should display user role label', () => {
      expect(component.roleLabel()).toBe('PHARMACIAN');
    });

    it('should display active status', () => {
      expect(component.statusLabel()).toBe('Active');
    });
  });

  describe('Email Validation', () => {
    it('should validate required email', () => {
      const emailControl = component.emailControl();
      emailControl.setValue('');
      expect(emailControl.hasError('required')).toBeTruthy();
    });

    it('should validate email format', () => {
      const emailControl = component.emailControl();
      emailControl.setValue('invalid-email');
      expect(emailControl.hasError('email')).toBeTruthy();
    });

    it('should accept valid email', () => {
      const emailControl = component.emailControl();
      emailControl.setValue('valid@hospital.local');
      expect(emailControl.valid).toBeTruthy();
    });
  });

  describe('Password Validation', () => {
    it('should require minimum 8 characters', () => {
      const newPasswordControl = component.newPasswordControl();
      newPasswordControl.setValue('Short1!');
      expect(component.hasMinLength()).toBeFalsy();
    });

    it('should require uppercase letter', () => {
      const newPasswordControl = component.newPasswordControl();
      newPasswordControl.setValue('password123!');
      expect(component.hasUppercase()).toBeFalsy();
    });

    it('should require number', () => {
      const newPasswordControl = component.newPasswordControl();
      newPasswordControl.setValue('Password!');
      expect(component.hasNumber()).toBeFalsy();
    });

    it('should require special character', () => {
      const newPasswordControl = component.newPasswordControl();
      newPasswordControl.setValue('Password123');
      expect(component.hasSpecial()).toBeFalsy();
    });

    it('should accept valid password', () => {
      const newPasswordControl = component.newPasswordControl();
      newPasswordControl.setValue('ValidPass123!');
      expect(component.hasMinLength()).toBeTruthy();
      expect(component.hasUppercase()).toBeTruthy();
      expect(component.hasNumber()).toBeTruthy();
      expect(component.hasSpecial()).toBeTruthy();
    });

    it('should validate password match', () => {
      const newPasswordControl = component.newPasswordControl();
      const confirmPasswordControl = component.confirmPasswordControl();

      newPasswordControl.setValue('ValidPass123!');
      confirmPasswordControl.setValue('DifferentPass123!');

      component.passwordForm.updateValueAndValidity();
      expect(component.passwordForm.hasError('mismatch')).toBeTruthy();
    });

    it('should accept matching passwords', () => {
      const newPasswordControl = component.newPasswordControl();
      const confirmPasswordControl = component.confirmPasswordControl();

      newPasswordControl.setValue('ValidPass123!');
      confirmPasswordControl.setValue('ValidPass123!');

      component.passwordForm.updateValueAndValidity();
      expect(component.passwordForm.hasError('mismatch')).toBeFalsy();
    });
  });

  describe('Save Profile', () => {
    it('should call updateCurrentUser on valid form submission', async () => {
      mockAuthService.updateCurrentUser.mockReturnValueOnce(of(mockUser));

      component.emailControl().setValue('newemail@hospital.local');
      component.profileForm.markAsDirty();

      component.onSaveProfile();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockAuthService.updateCurrentUser).toHaveBeenCalled();
    });

    it('should show success toast on profile update', async () => {
      mockAuthService.updateCurrentUser.mockReturnValueOnce(of(mockUser));

      component.emailControl().setValue('newemail@hospital.local');
      component.profileForm.markAsDirty();

      component.onSaveProfile();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockToastService.success).toHaveBeenCalledWith('Profile updated successfully');
    });

    it('should show error toast on profile update failure', async () => {
      const error = { error: { msg: 'Email already exists' } };
      mockAuthService.updateCurrentUser.mockReturnValueOnce(throwError(() => error));

      component.emailControl().setValue('duplicate@hospital.local');
      component.profileForm.markAsDirty();

      component.onSaveProfile();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockToastService.error).toHaveBeenCalledWith('Email already exists');
    });

    it('should prevent double submit', () => {
      mockAuthService.updateCurrentUser.mockReturnValueOnce(of(mockUser));

      component.emailControl().setValue('newemail@hospital.local');
      component.profileForm.markAsDirty();

      component.isSaving.set(true);
      component.onSaveProfile();

      expect(mockAuthService.updateCurrentUser).not.toHaveBeenCalled();
    });
  });

  describe('Save Password', () => {
    it('should call updateCurrentUser with password on submission', async () => {
      mockAuthService.updateCurrentUser.mockReturnValueOnce(of(mockUser));

      component.currentPasswordControl().setValue('CurrentPass123!');
      component.newPasswordControl().setValue('NewPass123!');
      component.confirmPasswordControl().setValue('NewPass123!');
      component.passwordForm.markAsDirty();

      component.onSavePassword();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockAuthService.updateCurrentUser).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockUser.id,
          password: 'NewPass123!'
        })
      );
    });

    it('should show success toast on password update', async () => {
      mockAuthService.updateCurrentUser.mockReturnValueOnce(of(mockUser));

      component.currentPasswordControl().setValue('CurrentPass123!');
      component.newPasswordControl().setValue('NewPass123!');
      component.confirmPasswordControl().setValue('NewPass123!');
      component.passwordForm.markAsDirty();

      component.onSavePassword();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockToastService.success).toHaveBeenCalledWith('Password updated successfully');
    });

    it('should show error toast on password update failure', async () => {
      const error = { error: { msg: 'Current password is incorrect' } };
      mockAuthService.updateCurrentUser.mockReturnValueOnce(throwError(() => error));

      component.currentPasswordControl().setValue('WrongPass123!');
      component.newPasswordControl().setValue('NewPass123!');
      component.confirmPasswordControl().setValue('NewPass123!');
      component.passwordForm.markAsDirty();

      component.onSavePassword();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockToastService.error).toHaveBeenCalledWith('Current password is incorrect');
    });
  });

  describe('Form Reset', () => {
    it('should reset profile form to original values', () => {
      const originalEmail = component.emailControl().value;

      component.emailControl().setValue('changed@hospital.local');
      expect(component.emailControl().value).not.toBe(originalEmail);

      component.onResetProfile();

      expect(component.emailControl().value).toBe(originalEmail);
    });

    it('should reset password form to empty', () => {
      component.currentPasswordControl().setValue('SomePassword123!');
      component.newPasswordControl().setValue('NewPassword123!');
      component.confirmPasswordControl().setValue('NewPassword123!');

      component.onResetPassword();

      expect(component.currentPasswordControl().value).toBeNull();
      expect(component.newPasswordControl().value).toBeNull();
      expect(component.confirmPasswordControl().value).toBeNull();
    });
  });

  describe('Form State', () => {
    it('should mark form as dirty when email changes', () => {
      expect(component.profileForm.pristine).toBeTruthy();

      component.emailControl().setValue('changed@hospital.local');
      component.profileForm.markAsDirty();

      expect(component.profileForm.dirty).toBeTruthy();
    });

    it('should disable save button when form is invalid', () => {
      component.emailControl().setValue('invalid-email');
      component.profileForm.markAsDirty();

      expect(component.profileForm.invalid).toBeTruthy();
    });
  });
});
