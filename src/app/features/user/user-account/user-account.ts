import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CardComponent } from "../../../components/card/card.component";
import { ButtonComponent } from "../../../components/button/button.component";


@Component({
  selector: 'app-user-account',
  standalone: true,
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
                  A
                </div>

                <h2
                  class="mt-4 text-xl font-semibold
                         text-[var(--app-text-primary)]"
                >
                  Admin User
                </h2>

                <p
                  class="text-sm text-[var(--app-text-secondary)]"
                >
                  System Administrator
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
                  Active
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
                      Account Type
                    </span>

                    <span
                      class="text-sm font-medium text-[var(--app-text-primary)]"
                    >
                      Administrator
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
                      Today
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
                      Online
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
                class="space-y-5"
              >
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <!-- First Name -->
                  <div>
                    <label
                      class="block text-sm font-medium
                             text-[var(--app-text-primary)] mb-2"
                    >
                      First Name
                    </label>

                    <input
                      type="text"
                      formControlName="firstName"
                      class="w-full px-4 py-2 rounded-lg
                             border border-[var(--app-border-strong)]
                             bg-[var(--app-surface)]
                             text-[var(--app-text-primary)]
                             focus:outline-none
                             focus:ring-2
                             focus:ring-[var(--app-brand)]"
                    />
                  </div>

                  <!-- Last Name -->
                  <div>
                    <label
                      class="block text-sm font-medium
                             text-[var(--app-text-primary)] mb-2"
                    >
                      Last Name
                    </label>

                    <input
                      type="text"
                      formControlName="lastName"
                      class="w-full px-4 py-2 rounded-lg
                             border border-[var(--app-border-strong)]
                             bg-[var(--app-surface)]
                             text-[var(--app-text-primary)]
                             focus:outline-none
                             focus:ring-2
                             focus:ring-[var(--app-brand)]"
                    />
                  </div>
                </div>

                <!-- Email -->
                <div>
                  <label
                    class="block text-sm font-medium
                           text-[var(--app-text-primary)] mb-2"
                  >
                    Email Address
                  </label>

                  <input
                    type="email"
                    formControlName="email"
                    class="w-full px-4 py-2 rounded-lg
                           border border-[var(--app-border-strong)]
                           bg-[var(--app-surface)]
                           text-[var(--app-text-primary)]
                           focus:outline-none
                           focus:ring-2
                           focus:ring-[var(--app-brand)]"
                  />
                </div>

                <!-- Username -->
                <div>
                  <label
                    class="block text-sm font-medium
                           text-[var(--app-text-primary)] mb-2"
                  >
                    Username
                  </label>

                  <input
                    type="text"
                    formControlName="username"
                    class="w-full px-4 py-2 rounded-lg
                           border border-[var(--app-border-strong)]
                           bg-[var(--app-surface)]
                           text-[var(--app-text-primary)]
                           focus:outline-none
                           focus:ring-2
                           focus:ring-[var(--app-brand)]"
                  />
                </div>

                <!-- Actions -->
                <div class="flex justify-end pt-4">
                  <app-button>
                    Save Changes
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
                class="space-y-5"
              >
                <div>
                  <label
                    class="block text-sm font-medium
                           text-[var(--app-text-primary)] mb-2"
                  >
                    Current Password
                  </label>

                  <input
                    type="password"
                    formControlName="currentPassword"
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
                      class="block text-sm font-medium
                             text-[var(--app-text-primary)] mb-2"
                    >
                      New Password
                    </label>

                    <input
                      type="password"
                      formControlName="newPassword"
                      class="w-full px-4 py-2 rounded-lg
                             border border-[var(--app-border-strong)]
                             bg-[var(--app-surface)]
                             text-[var(--app-text-primary)]
                             focus:outline-none
                             focus:ring-2
                             focus:ring-[var(--app-brand)]"
                    />
                  </div>

                  <div>
                    <label
                      class="block text-sm font-medium
                             text-[var(--app-text-primary)] mb-2"
                    >
                      Confirm Password
                    </label>

                    <input
                      type="password"
                      formControlName="confirmPassword"
                      class="w-full px-4 py-2 rounded-lg
                             border border-[var(--app-border-strong)]
                             bg-[var(--app-surface)]
                             text-[var(--app-text-primary)]
                             focus:outline-none
                             focus:ring-2
                             focus:ring-[var(--app-brand)]"
                    />
                  </div>
                </div>

                <div class="flex justify-end pt-4">
                  <app-button>
                    Update Password
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
  profileForm = new FormGroup({
    firstName: new FormControl('Admin'),
    lastName: new FormControl('User'),
    email: new FormControl('admin@example.com'),
    username: new FormControl('admin')
  });

  passwordForm = new FormGroup({
    currentPassword: new FormControl(''),
    newPassword: new FormControl(''),
    confirmPassword: new FormControl('')
  });
}