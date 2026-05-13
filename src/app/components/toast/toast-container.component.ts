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
      success: 'bg-[var(--app-success-strong)] text-[var(--app-surface)]',
      error: 'bg-[var(--app-danger)] text-white',
      info: 'bg-[var(--app-info-strong)] text-[var(--app-surface)]',
      warning: 'bg-[var(--app-warning-strong)] text-[var(--app-surface)]'
    };
    return typeClasses[type] || typeClasses['info'];
  }
}
