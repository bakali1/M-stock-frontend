import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ButtonComponent } from '../../components/button/button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
      <div class="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div class="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/20 blur-3xl"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl"></div>
        <div class="absolute top-20 right-32 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl"></div>
      </div>

      <div class="relative w-full max-w-md">
        <div class="mb-8 text-center">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500 text-slate-950 font-black text-2xl">M</div>
          <h1 class="mt-4 text-3xl font-semibold tracking-tight">M-Stock Access</h1>
          <p class="mt-2 text-sm text-slate-300">Secure inventory operations portal</p>
        </div>

        <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
            <div>
              <label for="username" class="block text-sm font-medium text-slate-200">Username or email</label>
              <input
                id="username"
                type="text"
                formControlName="username"
                autocomplete="username"
                class="mt-2 w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              @if (form.get('username')?.errors?.['required'] && form.get('username')?.touched) {
                <p class="mt-1 text-xs text-rose-300">Username required</p>
              }
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-slate-200">Password</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                autocomplete="current-password"
                class="mt-2 w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              @if (form.get('password')?.errors?.['required'] && form.get('password')?.touched) {
                <p class="mt-1 text-xs text-rose-300">Password required</p>
              }
            </div>

            <div class="flex items-center justify-between text-xs text-slate-300">
              <span>Role-based access enforced</span>
              <span class="text-slate-400">Use valid account</span>
            </div>

            <app-button type="submit" [disabled]="!form.valid || submitting()" [loading]="submitting()" ariaLabel="Sign in">
              Sign in
            </app-button>
          </form>
        </div>

        <p class="mt-6 text-center text-xs text-slate-400">Need access? Contact admin.</p>
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
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] })
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
