import { Component, ChangeDetectionStrategy, input, output, inject, effect } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Batch } from '../../../models/batch.model';
import { ButtonComponent } from '../../../components/button/button.component';

@Component({
  selector: 'app-quarantine-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  template: `
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center" style="z-index: 50;">
      <div class="bg-[var(--app-surface)] rounded-lg shadow-lg max-w-md w-full mx-4">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-[var(--app-border)]">
          <h2 class="text-xl font-bold text-[var(--app-text-primary)]">Quarantine Batch</h2>
        </div>

        <!-- Modal Content -->
        <div class="px-6 py-4 space-y-4">
          <!-- Batch Info (Read-only) -->
          <div class="bg-[var(--app-surface-muted)] p-4 rounded-lg space-y-3 mb-4">
            <div>
              <p class="text-xs text-[var(--app-text-muted)] mb-1">Lot Number</p>
              <p class="text-sm font-semibold text-[var(--app-text-primary)]">{{ batch().lotNumber }}</p>
            </div>
            <div>
              <p class="text-xs text-[var(--app-text-muted)] mb-1">Product</p>
              <p class="text-sm font-semibold text-[var(--app-text-primary)]">{{ batch().productName }}</p>
            </div>
            <div>
              <p class="text-xs text-[var(--app-text-muted)] mb-1">Current Quantity</p>
              <p class="text-sm font-semibold text-[var(--app-text-primary)]">{{ batch().quantity }} units</p>
            </div>
          </div>

          <!-- Reason Form -->
          <form [formGroup]="form">
            <div>
              <label
                for="quarantine-reason"
                class="block text-sm font-medium text-[var(--app-text-primary)] mb-2"
              >
                Reason for Quarantine <span class="text-[var(--app-danger)]">*</span>
              </label>
              <textarea
                id="quarantine-reason"
                formControlName="reason"
                rows="4"
                class="w-full px-3 py-2 border border-[var(--app-border)] rounded-lg text-[var(--app-text-primary)] bg-[var(--app-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--app-brand)] focus:border-transparent"
                placeholder="Describe the reason for quarantining this batch..."
                [attr.aria-invalid]="form.get('reason')?.invalid && form.get('reason')?.touched"
                [attr.aria-describedby]="form.get('reason')?.invalid && form.get('reason')?.touched ? 'quarantine-reason-error' : null"
              ></textarea>
              
              <!-- Validation Errors -->
              @if (form.get('reason')?.hasError('required') && form.get('reason')?.touched) {
                <p id="quarantine-reason-error" class="text-xs text-[var(--app-danger)] mt-1">Reason is required</p>
              }
              @if (form.get('reason')?.hasError('minlength') && form.get('reason')?.touched) {
                <p id="quarantine-reason-error" class="text-xs text-[var(--app-danger)] mt-1">
                  Reason must be at least 10 characters ({{ form.get('reason')?.value?.length || 0 }}/10)
                </p>
              }
              
              <!-- Character count -->
              <p class="text-xs text-[var(--app-text-muted)] mt-1">
                {{ form.get('reason')?.value?.length || 0 }} characters
              </p>
            </div>
          </form>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-[var(--app-border)] flex gap-3 justify-end">
          <app-button
            variant="ghost"
            size="md"
            (onClick)="handleCancel()"
            [disabled]="isSubmitting()"
          >
            Cancel
          </app-button>
          <app-button
            variant="danger"
            size="md"
            (onClick)="handleConfirm()"
            [disabled]="!form.valid || isSubmitting()"
            [loading]="isSubmitting()"
          >
            Quarantine
          </app-button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuarantineModalComponent {
  batch = input.required<Batch>();
  isSubmitting = input(false);
  
  onCancel = output<void>();
  onConfirm = output<string>();

  private formBuilder = inject(FormBuilder);

  form = this.formBuilder.group({
    reason: ['', [Validators.required, Validators.minLength(10)]]
  });

  constructor() {
    effect(() => {
      const reasonControl = this.form.get('reason');
      if (!reasonControl) {
        return;
      }

      if (this.isSubmitting()) {
        reasonControl.disable({ emitEvent: false });
      } else {
        reasonControl.enable({ emitEvent: false });
      }
    });
  }

  handleCancel() {
    this.onCancel.emit();
  }

  handleConfirm() {
    if (!this.form.valid) return;
    const reason = this.form.value.reason;
    if (reason) {
      this.onConfirm.emit(reason);
    }
  }
}
