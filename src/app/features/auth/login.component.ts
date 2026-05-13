import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

import { ButtonComponent } from '../../components/button/button.component';
import { HeaderComponent } from '../../layouts/main-layout/header/header.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    HeaderComponent
  ],
  template: `
    <div
      class="min-h-screen flex flex-col bg-[var(--app-surface-alt)] text-[var(--app-text-primary)] transition-colors duration-300"
    >
      <app-header></app-header>

      <div class="relative flex-1 flex items-center justify-center px-6 overflow-hidden">
        <!-- Background effects -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div
            class="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-30
                   bg-blue-500"
          ></div>

          <div
            class="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20
                   bg-emerald-500"
          ></div>

          <div
            class="absolute top-20 right-32 w-64 h-64 rounded-full blur-3xl opacity-20
                   bg-amber-500"
          ></div>
        </div>

        <!-- Card -->
        <div class="relative w-full max-w-md">
          <!-- Logo / Title -->
          <div class="mb-8 text-center">
            <div
              class="inline-flex items-center justify-center
                     w-14 h-14 rounded-2xl
                     bg-[var(--app-brand)]
                     text-[var(--app-on-brand)]
                     shadow-lg
                     font-black text-2xl"
            >
              M
            </div>

            <h1 class="mt-5 text-3xl font-semibold tracking-tight">
              M-Stock Access
            </h1>

            <p class="mt-2 text-sm text-[var(--app-text-secondary)]">
              Secure inventory operations portal
            </p>
          </div>

          <!-- Form Card -->
          <div
            class="rounded-2xl border
                   border-[var(--app-border)]
                   bg-[var(--app-surface)]
                   shadow-xl backdrop-blur
                   p-6 transition-colors duration-300"
          >
            <form
              [formGroup]="form"
              (ngSubmit)="submit()"
              class="space-y-5"
            >
              <!-- Username -->
              <div>
                <label
                  for="username"
                  class="block text-sm font-medium text-[var(--app-text-primary)]"
                >
                  Username or email
                </label>

                <input
                  id="username"
                  type="text"
                  formControlName="username"
                  autocomplete="username"
                  class="mt-2 w-full rounded-xl border
                         border-[var(--app-border)]
                         bg-[var(--app-surface-alt)]
                         px-3 py-2.5
                         text-[var(--app-text-primary)]
                         placeholder:text-[var(--app-text-muted)]
                         transition-all duration-200
                         focus:outline-none
                         focus:ring-2
                         focus:ring-[var(--app-brand)]
                         focus:border-transparent"
                />

                @if (form.get('username')?.errors?.['required'] &&
                form.get('username')?.touched) {
                  <p class="mt-1 text-xs text-[var(--app-danger)]">
                    Username required
                  </p>
                }
              </div>

              <!-- Password -->
              <div>
                <label
                  for="password"
                  class="block text-sm font-medium text-[var(--app-text-primary)]"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  formControlName="password"
                  autocomplete="current-password"
                  class="mt-2 w-full rounded-xl border
                         border-[var(--app-border)]
                         bg-[var(--app-surface-alt)]
                         px-3 py-2.5
                         text-[var(--app-text-primary)]
                         placeholder:text-[var(--app-text-muted)]
                         transition-all duration-200
                         focus:outline-none
                         focus:ring-2
                         focus:ring-[var(--app-brand)]
                         focus:border-transparent"
                />

                @if (form.get('password')?.errors?.['required'] &&
                form.get('password')?.touched) {
                  <p class="mt-1 text-xs text-[var(--app-danger)]">
                    Password required
                  </p>
                }
              </div>

              <!-- Footer -->
              <div
                class="flex items-center justify-between
                       text-xs text-[var(--app-text-secondary)]"
              >
                <span>Role-based access enforced</span>

                <span class="text-[var(--app-text-muted)]">
                  Use valid account
                </span>
              </div>

              <!-- Submit -->
            <div class="flex justify-center">
              <app-button
                type="submit"
                [disabled]="!form.valid || submitting()"
                [loading]="submitting()"
                ariaLabel="Sign in"
              >
                Sign in
              </app-button>
            </div>
            </form>
          </div>

          <!-- Bottom text -->
          <p
            class="mt-6 text-center text-xs text-[var(--app-text-muted)]"
          >
            Need access? Contact admin.
          </p>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  submitting = signal(false);

  form = new FormGroup({
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),

    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  submit() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.toastService.success('Login ok');
        this.submitting.set(false);

        this.router.navigate(['/dashboard']);
      },

      error: () => {
        this.toastService.error('Login failed');
        this.submitting.set(false);
      }
    });
  }
}