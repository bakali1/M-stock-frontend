import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, AuthUser } from '../../../services/auth.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
  <aside class="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
  <!-- Navigation -->
  <nav class="p-6 space-y-2 flex-1">
    @for (item of navItems; track item.path) {
      <a
        [routerLink]="item.path"
        routerLinkActive="bg-blue-50 border-l-4 border-blue-600 text-blue-600"
        class="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition"
      >
        <span class="flex items-center gap-3">
          <span class="text-lg">{{ item.icon }}</span>
          <span class="font-medium">{{ item.label }}</span>
        </span>
      </a>
    }
  </nav>

  <!-- Bottom Account Section -->
  <div class="p-2 border-t border-gray-200 mt-auto">
    <button
      class="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 transition"
    >
      <!-- Avatar -->
      <div
        class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold"
      >
        {{ userLabel?.username?.charAt(0)?.toUpperCase() }}
      </div>

      <!-- User Info -->
      <div class="flex-1 text-left">
        <p class="text-sm font-semibold text-gray-800">
          {{userLabel?.username}}
        </p>

        <p class="text-xs text-gray-500">
          {{userLabel?.role}}
        </p>
      </div>

      <!-- Settings Icon -->
      <span class="text-gray-500">
        ⚙️
      </span>

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
  
  get userLabel(): AuthUser | null {
    const user = this.authService.user();

    if (!user) {
      return null;
    }

    return user;
  }

}
