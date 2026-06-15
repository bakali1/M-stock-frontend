import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../components/button/button.component';
import { AuthService } from '../../../services/auth.service';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  template: `
      <header class="fixed top-0 left-0 right-0 h-16 bg-[var(--app-surface)] border-b border-[var(--app-border)] px-6 shadow-sm z-50">
        <div class="flex justify-between items-center h-full">
        
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center">
            <img src="/medicine.ico" alt="Brand Logo" class="w-full h-full object-cover rounded-lg">
          </div>

          <h1 class="text-xl font-bold text-[var(--app-text-primary)]">M-Stock</h1>
        </div>

        <div class="flex items-center gap-3 text-sm text-[var(--app-text-secondary)]">
          <button
            type="button"
            class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--app-border)] text-[var(--app-text-secondary)] hover:bg-[var(--app-hover)] transition"
            (click)="toggleTheme()"
            [attr.aria-pressed]="isDark()"
            aria-label="Toggle color theme"
          >
            <span class="text-base">{{ isDark() ? '🌙' : '☀️' }}</span>
            <span class="text-sm">{{ isDark() ? 'Dark' : 'Light' }}</span>
          </button>
          



        </div>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private themeService = inject(ThemeService);

  opensettings = false;

  isDark(): boolean {
    return this.themeService.isDark();
  }

  toggleTheme() {
    this.themeService.toggle();
  }

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

  get userLabel(): string {
    const user = this.authService.user();

    if (!user) {
      return 'Unknown';
    }

    return user.role
      ? user.role
      : (user.username ?? user.email ?? 'User');
  }


  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
