import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-lg">M</span>
          </div>
          <h1 class="text-xl font-bold text-gray-900">M-Stock</h1>
        </div>
        <div class="text-sm text-gray-600">
          <span>Admin</span>
        </div>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {}
