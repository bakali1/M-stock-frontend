import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-6 right-6 space-y-2 pointer-events-none">
      @for (toast of toastService.toasts$(); track toast.id) {
        <div
          [class]="getToastClasses(toast.type)"
          role="alert"
          class="rounded-lg px-4 py-3 shadow-lg pointer-events-auto animate-in fade-in slide-in-from-bottom-4"
        >
          <p class="font-medium">{{ toast.message }}</p>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastContainerComponent {
  toastService = inject(ToastService);

  getToastClasses(type: string): string {
    const typeClasses: Record<string, string> = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      info: 'bg-blue-500 text-white',
      warning: 'bg-orange-500 text-white'
    };
    return typeClasses[type] || typeClasses['info'];
  }
}
