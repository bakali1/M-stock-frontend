import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
    <aside class="w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <nav class="p-6 space-y-2">
        @for (item of navItems; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="bg-blue-50 border-l-4 border-blue-600 text-blue-600"
            class="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            <span class="flex items-center gap-3">
              <span class="text-lg">{{ item.icon }}</span>
              <span class="font-medium">{{ item.label }}</span>
            </span>
          </a>
        }
      </nav>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Batches', path: '/batches', icon: '📦' },
    { label: 'Stock Movement', path: '/stock-movement', icon: '🔄' }
  ];
}
