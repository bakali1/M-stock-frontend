import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" (click)="onBackdropClick()" (keydown)="onEscapeKey($event)" tabindex="-1">
      <div class="bg-[var(--app-surface)] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between border-b border-[var(--app-border)] px-6 py-4">
          <h2 class="text-xl font-bold text-[var(--app-text-primary)]">{{ title() }}</h2>
          <button
            (click)="onClose.emit()"
            class="text-[var(--app-text-muted)] hover:text-[var(--app-text-secondary)] text-2xl leading-none"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div class="px-6 py-4">
          <ng-content></ng-content>
        </div>

        <div class="border-t border-[var(--app-border)] px-6 py-4 flex justify-end gap-3">
          <app-button variant="secondary" (onClick)="onClose.emit()">
            Cancel
          </app-button>
          @if (showSubmit()) {
            <app-button
              variant="primary"
              [loading]="submitting()"
              (onClick)="onSubmit.emit()"
            >
              {{ submitLabel() || 'Submit' }}
            </app-button>
          }
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent {
  title = input.required<string>();
  showSubmit = input(true);
  submitLabel = input<string | null>(null);
  submitting = input(false);
  closeOnBackdrop = input(true);
  
  onClose = output<void>();
  onSubmit = output<void>();

  onBackdropClick() {
    if (this.closeOnBackdrop()) {
      this.onClose.emit();
    }
  }

  onEscapeKey(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.onClose.emit();
    }
  }
}
