import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject, input, output, signal } from '@angular/core';
import { ButtonComponent } from '../../../../components/button/button.component';
import { Batch } from '../../../../models/batch.model';
import { BatchService } from '../../../../services/batch.service';
import { ToastService } from '../../../../services/toast.service';
import { QuarantineService } from '../../../../services/quarantine.service';
import { QuarantineModalComponent } from '../quarantine-modal.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-modal-batch',
  standalone: true,
  imports: [CommonModule, ButtonComponent, QuarantineModalComponent],
  template: `
    <div [class]="backdropClasses" (click)="onBackdropClick()" (keydown)="onEscapeKey($event)" tabindex="-1">
      <div class="bg-[var(--app-surface)] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between border-b border-[var(--app-border)] px-6 py-4">
          <h2 class="text-xl font-bold text-[var(--app-text-primary)]">{{ title() }}</h2>
          <div class="flex items-center gap-2">
            <ng-content select="[modal-actions]"></ng-content>
            <button
              (click)="onClose.emit()"
              [disabled]="closeDisabled() || isQuarantineSubmitting()"
              class="text-[var(--app-text-muted)] hover:text-[var(--app-text-secondary)] text-2xl leading-none disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        </div>
        
        <div class="px-6 py-4">
          <!-- Quarantine Form -->
          @if (showQuarantineForm() && batch()) {
            <app-quarantine-modal
              [batch]="batch()!"
              [isSubmitting]="isQuarantineSubmitting()"
              (onCancel)="closeQuarantineForm()"
              (onConfirm)="quarantineBatch($event)"
            ></app-quarantine-modal>
          } @else {
            <ng-content></ng-content>
          }
        </div>

        <div class="border-t border-[var(--app-border)] px-6 py-4 flex justify-end gap-3">
          <app-button variant="secondary" (onClick)="onClose.emit()" [disabled]="cancelDisabled() || isQuarantineSubmitting()">
            Cancel
          </app-button>

          @if (showSubmit()) {
            <app-button
              variant="primary"
              [loading]="submitting()"
              [disabled]="submitDisabled() || isQuarantineSubmitting()"
              (onClick)="onSubmit.emit()"
            >
              {{ submitLabel() || 'Submit' }}
            </app-button>
          }
          <!-- Quarantine button in header -->
            @if (batch() && !showQuarantineForm()) {
              <app-button
                variant="danger"
                size="md"
                [loading]="isQuarantineSubmitting()"
                [disabled]="isQuarantineSubmitting()"
                (onClick)="openQuarantineForm()"
              >
                Quarantine
              </app-button>
            }
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponentBatch {
  title = input.required<string>();
  showSubmit = input(true);
  submitLabel = input<string | null>(null);
  submitting = input(false);
  closeOnBackdrop = input(true);
  backdropClass = input('bg-black/50');
  submitDisabled = input(false);
  cancelDisabled = input(false);
  closeDisabled = input(false);
  batchInput = input<Batch | null>(null);

  
  onClose = output<void>();
  onSubmit = output<void>();

  // Quarantine
  showQuarantineForm = signal(false);
  batch = signal<Batch | null>(null);
  isQuarantineSubmitting = signal(false);
  private batchService = inject(BatchService);
  private toastService = inject(ToastService);
  private quarantineService = inject(QuarantineService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    // Watch for batch input changes
    effect(() => {
      const inputBatch = this.batchInput();
      if (inputBatch) {
        this.batch.set(inputBatch);
        this.cdr.markForCheck();
      }
    });

    // Watch for quarantine requests via signal from QuarantineService
    effect(() => {
      const requestedBatch = this.quarantineService.quarantineRequested();
      if (requestedBatch) {
        this.setBatchForQuarantine(requestedBatch);
        this.quarantineService.clearRequest();
      }
    });
  }

  get backdropClasses(): string {
    return `fixed inset-0 z-40 flex items-center justify-center p-4 ${this.backdropClass()}`;
  }

  onBackdropClick() {
    if (this.closeOnBackdrop() && !this.closeDisabled()) {
      this.onClose.emit();
    }
  }

  onEscapeKey(event: KeyboardEvent) {
    if (event.key === 'Escape' && !this.closeDisabled() && !this.isQuarantineSubmitting()) {
      this.onClose.emit();
    }
  }

  /**
   * Set batch for quarantine when requested via QuarantineService
   * This is called when a quarantine request is detected via signal
   */
  setBatchForQuarantine(batch: Batch) {
    if (batch.status === 'ACTIVE') {
      this.batch.set(batch);
      this.cdr.markForCheck();
    }
  }

  /**
   * Open the quarantine form when user clicks the Quarantine button
   */
  openQuarantineForm() {
    if (this.batch() && !this.isQuarantineSubmitting()) {
      this.showQuarantineForm.set(true);
      this.cdr.markForCheck();
    }
  }

  /**
   * Close the quarantine form without submitting
   */
  closeQuarantineForm() {
    this.showQuarantineForm.set(false);
    this.cdr.markForCheck();
  }

  /**
   * Submit quarantine request
   */
  quarantineBatch(reason: string) {
    if (!this.batch() || this.isQuarantineSubmitting()) return;

    this.isQuarantineSubmitting.set(true);
    this.batchService.quarantine(this.batch()!.id, reason)
      .pipe(
        finalize(() => {
          queueMicrotask(() => this.isQuarantineSubmitting.set(false));
        })
      )
      .subscribe({
        next: (updatedBatch: Batch) => {
          this.batch.set(updatedBatch);
          this.showQuarantineForm.set(false);
          this.toastService.success('Batch quarantined successfully');
          this.cdr.markForCheck();
        },
        error: (err: unknown) => {
          const errorMessage = (err as any)?.error?.msg || 'Failed to quarantine batch';
          this.toastService.error(errorMessage);
          // Keep form open so user can retry
        }
      });
  }
}
