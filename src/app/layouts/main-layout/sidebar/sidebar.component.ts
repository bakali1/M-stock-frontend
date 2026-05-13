import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, AuthUser } from '../../../services/auth.service';
import { ButtonComponent } from "../../../components/button/button.component";

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ButtonComponent],
  template: `
  <aside class="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-[var(--app-surface)] border-r border-[var(--app-border)] flex flex-col">
  <!-- Navigation -->
  <nav class="p-6 space-y-2 flex-1">
    @for (item of navItems; track item.path) {
      <a
        [routerLink]="item.path"
        routerLinkActive="bg-[var(--app-sidebar-active)] border-l-4 border-[var(--app-brand)] text-[var(--app-brand)]"
        class="block px-4 py-3 rounded-lg text-[var(--app-text-secondary)] hover:bg-[var(--app-hover)] transition"
      >
        <span class="flex items-center gap-3">
          <span class="text-lg">{{ item.icon }}</span>
          <span class="font-medium">{{ item.label }}</span>
        </span>
      </a>
    }
  </nav>

  <!-- Bottom Account Section -->
  <div class="p-2 border-t border-[var(--app-border)] mt-auto">
    <button
      class="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--app-hover)] transition"
    >
      <!-- Avatar -->
      <div
        class="w-10 h-10 rounded-full bg-[var(--app-brand)] flex items-center justify-center text-[var(--app-on-brand)] font-bold"
      >
        {{ userLabel?.username?.charAt(0)?.toUpperCase() }}
      </div>

      <!-- User Info -->
      <div class="flex-1 text-left">
        <p class="text-sm font-semibold text-[var(--app-text-primary)]">
          {{userLabel?.username}}
        </p>

        <p class="text-xs text-[var(--app-text-muted)]">
          {{userLabel?.role}}
        </p>
      </div>

      <!-- Settings Icon -->
        <div class="relative">
          <app-button
            variant="ghost"
            size="md"
            (onClick)="toggleSettings()"
            ariaLabel="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16">
              <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"/>
              <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z"/>
            </svg>

          </app-button>
          @if (opensettings) {
            <div
                class="absolute bottom-full right-0 mb-2 w-46 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl shadow-lg z-50 overflow-hidden"
              >
              <button
                class="w-full text-left px-4 py-3 hover:bg-[var(--app-hover)] transition"
                (click)="openAccountSettings()"
              >
                Account Settings
              </button>
              <button
                class="w-full text-left px-4 py-3 hover:bg-[var(--app-hover)] transition"
                (click)="openInfo()"
              >
                Info
              </button>
              <button
                class="w-full text-left px-4 py-3 hover:bg-[var(--app-hover)] transition text-[var(--app-danger)]"
                (click)="logout()"
              >
                Logout
              </button>
            </div>
          }

        </div>

    </button>

  </div>

</aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Batches', path: '/batches', icon: '📦' },
    { label: 'Stock Movement', path: '/stock-movement', icon: '🔄' },
    { label: 'Product', path: '/product', icon: '🏷️' }
  ];
  private authService = inject(AuthService);
  private router = inject(Router);

  opensettings = false;

  toggleSettings() {
    this.opensettings = !this.opensettings;
  }

  openAccountSettings() {
    console.log('Account settings clicked');
    this.router.navigate(['/account']);
    this.opensettings = false;
  }

  openInfo() {
    console.log('Info clicked');
    this.opensettings = false;
  }


  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }


  get userLabel(): AuthUser | null {
    const user = this.authService.user();

    if (!user) {
      return null;
    }

    return user;
  }

}
