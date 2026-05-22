import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardComponent } from "../../../components/card/card.component";
import { ButtonComponent } from "../../../components/button/button.component";
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { formatDateTime } from '../../../utils/date.util';
import { take } from 'rxjs';


@Component({
  selector: 'app-user-account',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    ButtonComponent
  ],
  template: `
    <div class="p-8 h-[calc(100vh-4rem)]">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-[var(--app-text-primary)]">
          User Account
        </h1>

        <p class="mt-2 text-[var(--app-text-secondary)]">
          Manage your profile and account settings
        </p>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Profile Card -->
        <div class="xl:col-span-1">
          <app-card>
            <div class="p-6">
              <div class="flex flex-col items-center text-center">
                <!-- Avatar -->
                <div
                  class="w-24 h-24 rounded-full
                         bg-[var(--app-brand)]
                         text-[var(--app-on-brand)]
                         flex items-center justify-center
                         text-3xl font-bold shadow-lg"
                >
                  {{ userInitial() }}
                </div>

                <h2
                  class="mt-4 text-xl font-semibold
                         text-[var(--app-text-primary)]"
                >
                  {{ user()?.username }}
                </h2>

                <p
                  class="text-sm text-[var(--app-text-secondary)]"
                >
                  {{ roleLabel() }}
                </p>

                <!-- Status -->
                <div
                  class="mt-4 inline-flex items-center gap-2
                         px-3 py-1 rounded-full
                         bg-[var(--app-success-muted)]
                         text-[var(--app-success-strong)]
                         text-sm font-medium"
                >
                  <span class="w-2 h-2 rounded-full bg-current"></span>
                  {{ statusLabel() }}
                </div>
              </div>

              <!-- Stats -->
              <div
                class="mt-8 pt-6 border-t border-[var(--app-border)]"
              >
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <span
                      class="text-sm text-[var(--app-text-secondary)]"
                    >
                       Role
                    </span>

                    <span
                      class="text-sm font-medium text-[var(--app-text-primary)]"
                    >
                      {{ user()?.role ?? 'N/A' }}
                    </span>
                  </div>

                  <div class="flex justify-between items-center">
                    <span
                      class="text-sm text-[var(--app-text-secondary)]"
                    >
                      User ID
                    </span>

                    <span
                      class="text-sm font-medium text-[var(--app-text-primary)]"
                    >
                      {{ user()?.id ?? 'N/A' }}
                    </span>
                  </div>

                  <div class="flex justify-between items-center">
                    <span
                      class="text-sm text-[var(--app-text-secondary)]"
                    >
                      Last Login
                    </span>

                    <span
                      class="text-sm font-medium text-[var(--app-text-primary)]"
                    >
                      {{ formattedLastLogin() }}
                    </span>
                  </div>

                  <div class="flex justify-between items-center">
                    <span
                      class="text-sm text-[var(--app-text-secondary)]"
                    >
                      Status
                    </span>

                    <span
                      class="text-sm font-medium text-[var(--app-success-strong)]"
                    >
                      {{ statusLabel() }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </app-card>
        </div>

        <!-- Settings -->
        <div class="xl:col-span-2 space-y-6">
          <!-- Profile Information -->
          <app-card>
            <div class="p-6">
              <div class="mb-6">
                <h2
                  class="text-xl font-semibold
                         text-[var(--app-text-primary)]"
                >
                  Profile Information
                </h2>

                <p
                  class="text-sm text-[var(--app-text-secondary)] mt-1"
                >
                  Update your account information
                </p>
              </div>

              <form
                [formGroup]="profileForm"
                (ngSubmit)="onSaveProfile()"
                class="space-y-5"
              >
                <!-- Email -->
                <div>
                  <label
                    for="email"
                    class="block text-sm font-medium
                           text-[var(--app-text-primary)] mb-2"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    formControlName="email"
                    [attr.aria-label]="'Email Address'"
                    [attr.aria-invalid]="emailControl().invalid && emailControl().touched"
                    class="w-full px-4 py-2 rounded-lg
                           border border-[var(--app-border-strong)]
                           bg-[var(--app-surface)]
                           text-[var(--app-text-primary)]
                           focus:outline-none
                           focus:ring-2
                           focus:ring-[var(--app-brand)]"
                  />
                  
                  @if (emailControl().invalid && emailControl().touched) {
                    <p class="mt-1 text-sm text-[var(--app-danger)]">
                      @if (emailControl().errors?.['required']) {
                        Email is required
                      } @else if (emailControl().errors?.['email']) {
                        Please enter a valid email address
                      }
                    </p>
                  }
                </div>

                <!-- Username (read-only) -->
                <div>
                  <label
                    for="username"
                    class="block text-sm font-medium
                           text-[var(--app-text-primary)] mb-2"
                  >
                    Username
                  </label>

                  <input
                    id="username"
                    type="text"
                    formControlName="username"
                    [disabled]="true"
                    class="w-full px-4 py-2 rounded-lg
                           border border-[var(--app-border-strong)]
                           bg-[var(--app-surface)]
                           text-[var(--app-text-secondary)]
                           opacity-60
                           focus:outline-none
                           focus:ring-2
                           focus:ring-[var(--app-brand)]"
                  />
                  <p class="mt-1 text-xs text-[var(--app-text-secondary)]">
                    Username cannot be changed
                  </p>
                </div>

                <div class="flex items-center gap-3">
                  <input
                    id="user-active"
                    type="checkbox"
                    formControlName="active"
                    [disabled]="true"
                    class="h-4 w-4 rounded
                           border border-[var(--app-border-strong)]
                           text-[var(--app-brand)]
                           focus:outline-none
                           focus:ring-2
                           focus:ring-[var(--app-brand)]"
                  />
                  <label
                    for="user-active"
                    class="text-sm font-medium text-[var(--app-text-primary)]"
                  >
                    Active
                  </label>
                  <p class="text-xs text-[var(--app-text-secondary)]">
                    Cannot be changed
                  </p>
                </div>

                <!-- Actions -->
                <div class="flex justify-end pt-4 gap-3">
                  <app-button
                    variant="secondary"
                    type="button"
                    [disabled]="isSaving() || !profileForm.dirty"
                    (onClick)="onResetProfile()"
                  >
                    Reset
                  </app-button>
                  <app-button
                    type="submit"
                    [disabled]="profileForm.invalid || isSaving() || !profileForm.dirty"
                    [loading]="isSaving()"
                  >
                    @if (isSaving()) {
                      Saving...
                    } @else {
                      Save Changes
                    }
                  </app-button>
                </div>
              </form>
            </div>
          </app-card>

          <!-- Security -->
          <app-card>
            <div class="p-6">
              <div class="mb-6">
                <h2
                  class="text-xl font-semibold
                         text-[var(--app-text-primary)]"
                >
                  Security
                </h2>

                <p
                  class="text-sm text-[var(--app-text-secondary)] mt-1"
                >
                  Update your password and security settings
                </p>
              </div>

              <form
                [formGroup]="passwordForm"
                (ngSubmit)="onSavePassword()"
                class="space-y-5"
              >
                <div>
                  <label
                    for="currentPassword"
                    class="block text-sm font-medium
                           text-[var(--app-text-primary)] mb-2"
                  >
                    Current Password
                  </label>

                  <input
                    id="currentPassword"
                    type="password"
                    formControlName="currentPassword"
                    [attr.aria-label]="'Current Password'"
                    [attr.aria-invalid]="currentPasswordControl().invalid && currentPasswordControl().touched"
                    class="w-full px-4 py-2 rounded-lg
                           border border-[var(--app-border-strong)]
                           bg-[var(--app-surface)]
                           text-[var(--app-text-primary)]
                           focus:outline-none
                           focus:ring-2
                           focus:ring-[var(--app-brand)]"
                  />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label
                      for="newPassword"
                      class="block text-sm font-medium
                             text-[var(--app-text-primary)] mb-2"
                    >
                      New Password
                    </label>

                    <input
                      id="newPassword"
                      type="password"
                      formControlName="newPassword"
                      [attr.aria-label]="'New Password'"
                      [attr.aria-invalid]="newPasswordControl().invalid && newPasswordControl().touched"
                      class="w-full px-4 py-2 rounded-lg
                             border border-[var(--app-border-strong)]
                             bg-[var(--app-surface)]
                             text-[var(--app-text-primary)]
                             focus:outline-none
                             focus:ring-2
                             focus:ring-[var(--app-brand)]"
                    />
                    
                    @if (newPasswordControl().invalid && newPasswordControl().touched) {
                      <ul class="mt-1 text-sm text-[var(--app-danger)] space-y-1">
                        @if (newPasswordControl().errors?.['minlength']) {
                          <li>• At least 8 characters required</li>
                        }
                        @if (!hasUppercase()) {
                          <li>• Must contain at least one uppercase letter</li>
                        }
                        @if (!hasNumber()) {
                          <li>• Must contain at least one number</li>
                        }
                        @if (!hasSpecial()) {
                          <li>• Must contain at least one special character (@, !, #, $, %, ^, &, *)</li>
                        }
                      </ul>
                    }
                  </div>

                  <div>
                    <label
                      for="confirmPassword"
                      class="block text-sm font-medium
                             text-[var(--app-text-primary)] mb-2"
                    >
                      Confirm Password
                    </label>

                    <input
                      id="confirmPassword"
                      type="password"
                      formControlName="confirmPassword"
                      [attr.aria-label]="'Confirm Password'"
                      [attr.aria-invalid]="confirmPasswordControl().invalid && confirmPasswordControl().touched"
                      class="w-full px-4 py-2 rounded-lg
                             border border-[var(--app-border-strong)]
                             bg-[var(--app-surface)]
                             text-[var(--app-text-primary)]
                             focus:outline-none
                             focus:ring-2
                             focus:ring-[var(--app-brand)]"
                    />
                    
                    @if (confirmPasswordControl().invalid && confirmPasswordControl().touched) {
                      <p class="mt-1 text-sm text-[var(--app-danger)]">
                        @if (confirmPasswordControl().errors?.['required']) {
                          Confirm password is required
                        } @else if (passwordForm.errors?.['mismatch']) {
                          Passwords do not match
                        }
                      </p>
                    }
                  </div>
                </div>

                <!-- Password Requirements -->
                @if (newPasswordControl().touched && newPasswordControl().value) {
                  <div class="p-4 rounded-lg bg-[var(--app-surface-muted)] border border-[var(--app-border)]">
                    <p class="text-xs font-medium text-[var(--app-text-secondary)] mb-2">Password Requirements:</p>
                    <ul class="text-xs text-[var(--app-text-secondary)] space-y-1">
                      <li [class.text-[var(--app-success)]]="hasMinLength()" class="flex gap-2">
                        <span>{{ hasMinLength() ? '✓' : '◯' }}</span>
                        <span>At least 8 characters</span>
                      </li>
                      <li [class.text-[var(--app-success)]]="hasUppercase()" class="flex gap-2">
                        <span>{{ hasUppercase() ? '✓' : '◯' }}</span>
                        <span>One uppercase letter (A-Z)</span>
                      </li>
                      <li [class.text-[var(--app-success)]]="hasNumber()" class="flex gap-2">
                        <span>{{ hasNumber() ? '✓' : '◯' }}</span>
                        <span>One number (0-9)</span>
                      </li>
                      <li [class.text-[var(--app-success)]]="hasSpecial()" class="flex gap-2">
                        <span>{{ hasSpecial() ? '✓' : '◯' }}</span>
                        <span>One special character (@, !, #, $, %, ^, &, *)</span>
                      </li>
                    </ul>
                  </div>
                }

                <!-- Actions -->
                <div class="flex justify-end pt-4 gap-3">
                  <app-button
                    variant="secondary"
                    type="button"
                    [disabled]="isSavingPassword() || !passwordForm.dirty"
                    (onClick)="onResetPassword()"
                  >
                    Reset
                  </app-button>
                  <app-button
                    type="submit"
                    [disabled]="passwordForm.invalid || isSavingPassword() || !passwordForm.dirty"
                    [loading]="isSavingPassword()"
                  >
                    @if (isSavingPassword()) {
                      Updating...
                    } @else {
                      Update Password
                    }
                  </app-button>
                </div>
              </form>
            </div>
          </app-card>
        </div>
      </div>
    </div>
  `
})
export class UserAccount {

  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  
  user = this.authService.currentUser;
  isSaving = signal(false);
  isSavingPassword = signal(false);

  userInitial = computed(() => {
    const username = this.user()?.username;
    return username ? username.charAt(0).toUpperCase() : '?';
  });
  statusLabel = computed(() => (this.user()?.active ? 'Active' : 'Inactive'));
  roleLabel = computed(() => this.user()?.role ?? 'User');
  formattedLastLogin = computed(() => this.formatLastLogin(this.user()?.lastLogin));

  // Password validation helpers
  hasMinLength = computed(() => {
    const password = this.newPasswordControl().value;
    return password && password.length >= 8;
  });

  hasUppercase = computed(() => {
    const password = this.newPasswordControl().value;
    return password && /[A-Z]/.test(password);
  });

  hasNumber = computed(() => {
    const password = this.newPasswordControl().value;
    return password && /[0-9]/.test(password);
  });

  hasSpecial = computed(() => {
    const password = this.newPasswordControl().value;
    return password && /[@!#$%^&*]/.test(password);
  });

  // Custom validators
  private passwordValidator = (control: any): any => {
    if (!control.value) return null;
    
    const password = control.value;
    const errors: any = {};
    
    if (password.length < 8) {
      errors['minlength'] = { requiredLength: 8, actualLength: password.length };
    }
    if (!/[A-Z]/.test(password)) {
      errors['uppercase'] = true;
    }
    if (!/[0-9]/.test(password)) {
      errors['number'] = true;
    }
    if (!/[@!#$%^&*]/.test(password)) {
      errors['special'] = true;
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
  };

  private passwordMatchValidator = (group: any): any => {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword === confirmPassword ? null : { mismatch: true };
  };

  profileForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    username: new FormControl({ value: '', disabled: true }),
    active: new FormControl({ value: false, disabled: true })
  });

  passwordForm = new FormGroup(
    {
      currentPassword: new FormControl(''),
      newPassword: new FormControl('', this.passwordValidator as any),
      confirmPassword: new FormControl('')
    },
    { validators: this.passwordMatchValidator as any }
  );

  // Getters for form controls
  emailControl = () => this.profileForm.get('email') as FormControl;
  currentPasswordControl = () => this.passwordForm.get('currentPassword') as FormControl;
  newPasswordControl = () => this.passwordForm.get('newPassword') as FormControl;
  confirmPasswordControl = () => this.passwordForm.get('confirmPassword') as FormControl;

  constructor() {
    this.authService.getCurrentUser().pipe(take(1)).subscribe();
    effect(() => {
      const currentUser = this.user();
      if (!currentUser) {
        return;
      }
      this.profileForm.patchValue({
        email: currentUser.email,
        username: currentUser.username,
        active: currentUser.active
      });
    });
  }

  onSaveProfile() {
    if (this.profileForm.invalid || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    const updates = {
      id: this.user()?.id,
      email: this.emailControl().value
    };

    this.authService.updateCurrentUser(updates)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.toastService.success('Profile updated successfully');
          this.profileForm.markAsPristine();
        },
        error: (error) => {
          this.isSaving.set(false);
          const errorMsg = error?.error?.msg || 'Failed to update profile. Please try again.';
          this.toastService.error(errorMsg);
        }
      });
  }

  onSavePassword() {
    if (this.passwordForm.invalid || this.isSavingPassword()) {
      return;
    }

    this.isSavingPassword.set(true);
    const updates = {
      id: this.user()?.id,
      password: this.newPasswordControl().value
    };

    this.authService.updateCurrentUser(updates)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.isSavingPassword.set(false);
          this.toastService.success('Password updated successfully');
          this.passwordForm.reset();
          this.passwordForm.markAsPristine();
        },
        error: (error) => {
          this.isSavingPassword.set(false);
          const errorMsg = error?.error?.msg || 'Failed to update password. Please try again.';
          this.toastService.error(errorMsg);
        }
      });
  }

  onResetProfile() {
    const currentUser = this.user();
    if (!currentUser) return;
    
    this.profileForm.patchValue({
      email: currentUser.email,
      username: currentUser.username,
      active: currentUser.active
    });
    this.profileForm.markAsPristine();
  }

  onResetPassword() {
    this.passwordForm.reset();
    this.passwordForm.markAsPristine();
  }

  private formatLastLogin(value?: string | null): string {
    if (!value) {
      return 'N/A';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'N/A';
    }
    return formatDateTime(value);
  }
}
