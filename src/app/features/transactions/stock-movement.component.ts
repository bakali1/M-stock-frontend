import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { TransactionService } from '../../services/transaction.service';
import { BatchService } from '../../services/batch.service';
import { ToastService } from '../../services/toast.service';

import { CardComponent } from '../../components/card/card.component';
import { ButtonComponent } from '../../components/button/button.component';

import { Batch } from '../../models/batch.model';
import { TransactionType } from '../../models/enums';

@Component({
  selector: 'app-stock-movement',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    ButtonComponent
  ],
  template: `
    <div class="p-8 h-[calc(100vh-4rem)]">
      <h1
        class="text-3xl font-bold text-[var(--app-text-primary)] mb-8"
      >
        Stock Movement
      </h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Tabs -->
        <div class="lg:col-span-1">
          <div class="space-y-2">
            @for (type of types; track type) {
              <button
                type="button"
                (click)="selectType(type)"
                class="w-full px-4 py-2 rounded-lg font-medium transition"
                [class.bg-[var(--app-brand)]]="currentType() === type"
                [class.text-[var(--app-on-brand)]]="currentType() === type"
                [class.bg-[var(--app-surface-muted)]]="currentType() !== type"
                [class.text-[var(--app-text-secondary)]]="currentType() !== type"
                [class.hover\:bg-[var(--app-hover)]]="currentType() !== type"
              >
                {{ type }}
              </button>
            }
          </div>
        </div>

        <!-- Form -->
        <div class="lg:col-span-2">
          <app-card>
            <div class="p-6">
              <form
                [formGroup]="form"
                (ngSubmit)="submit()"
              >
                <!-- Hidden type -->
                <input
                  type="hidden"
                  [value]="currentType()"
                />

                <!-- Batch Lookup -->
                <div class="mb-6">
                  <label
                    class="block text-sm font-medium text-[var(--app-text-primary)] mb-2"
                  >
                    Batch / NSN
                  </label>

                  <div class="relative">
                    <input
                      type="text"
                      [formControl]="batchLookup"
                      placeholder="Search by lot number or NSN..."
                      autocomplete="off"
                      class="w-full px-4 py-2 border border-[var(--app-border-strong)] rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-[var(--app-brand)]
                             bg-[var(--app-surface)] text-[var(--app-text-primary)]"
                    />

                    <!-- Suggestions -->
                    @if (suggestions().length > 0 && showSuggestions()) {
                      <div
                        class="absolute top-full left-0 right-0 z-10
                               bg-[var(--app-surface)]
                               border border-[var(--app-border-strong)]
                               rounded-b-lg shadow-lg
                               max-h-64 overflow-y-auto"
                      >
                        @for (batch of suggestions(); track batch.id) {
                          <button
                            type="button"
                            (click)="selectBatch(batch)"
                            class="w-full text-left px-4 py-2
                                   hover:bg-[var(--app-sidebar-active)]
                                   border-b border-[var(--app-border)]"
                          >
                            <p class="font-semibold text-sm">
                              {{ batch.lotNumber }}
                            </p>

                            <p
                              class="text-xs text-[var(--app-text-secondary)]"
                            >
                              {{ batch.productName }}
                              ({{ batch.nsnCode }})
                            </p>
                          </button>
                        }
                      </div>
                    }
                  </div>

                  <!-- Selected Batch -->
                  @if (selectedBatch(); as batch) {
                    <div
                      class="mt-3 p-3 rounded-lg
                             bg-[var(--app-info-muted)]
                             border border-[var(--app-border)]"
                    >
                      <p
                        class="text-sm font-semibold text-[var(--app-text-primary)]"
                      >
                        {{ batch.productName }}
                      </p>

                      <p
                        class="text-xs text-[var(--app-text-secondary)]"
                      >
                        Lot: {{ batch.lotNumber }}
                      </p>

                      <p
                        class="text-xs text-[var(--app-text-secondary)]"
                      >
                        Current: {{ batch.quantity }} units
                      </p>
                    </div>
                  }

                  <!-- View all -->
                  @if (batchLookup.value) {
                    <p class="text-xs mt-2">
                      <button
                        type="button"
                        (click)="viewAllResults()"
                        class="text-[var(--app-link)] hover:underline"
                      >
                        View all results for "{{ batchLookup.value }}"
                      </button>
                    </p>
                  }
                </div>

                <!-- Quantity -->
                <div class="mb-6">
                  <label
                    class="block text-sm font-medium text-[var(--app-text-primary)] mb-2"
                  >
                    Quantity
                  </label>

                  <input
                    type="number"
                    formControlName="quantity"
                    placeholder="Enter quantity"
                    min="1"
                    class="w-full px-4 py-2 border border-[var(--app-border-strong)]
                           rounded-lg focus:outline-none focus:ring-2
                           focus:ring-[var(--app-brand)]
                           bg-[var(--app-surface)]
                           text-[var(--app-text-primary)]"
                  />

                  @if (
                    form.get('quantity')?.errors?.['required'] &&
                    form.get('quantity')?.touched
                  ) {
                    <p
                      class="text-[var(--app-danger)] text-sm mt-1"
                    >
                      Quantity required
                    </p>
                  }

                  @if (
                    form.get('quantity')?.errors?.['min'] &&
                    form.get('quantity')?.touched
                  ) {
                    <p
                      class="text-[var(--app-danger)] text-sm mt-1"
                    >
                      Quantity must be > 0
                    </p>
                  }
                </div>

                <!-- Reason -->
                <div class="mb-8">
                  <label
                    class="block text-sm font-medium text-[var(--app-text-primary)] mb-2"
                  >
                    Reason (Optional)
                  </label>

                  <textarea
                    formControlName="reason"
                    rows="3"
                    placeholder="Enter reason for this movement..."
                    class="w-full px-4 py-2 border border-[var(--app-border-strong)]
                           rounded-lg focus:outline-none focus:ring-2
                           focus:ring-[var(--app-brand)]
                           bg-[var(--app-surface)]
                           text-[var(--app-text-primary)]"
                  ></textarea>
                </div>

                <!-- Actions -->
                <div class="flex gap-3">
                  <app-button
                    type="submit"
                    [disabled]="!form.valid || submitting()"
                    [loading]="submitting()"
                  >
                    Record Movement
                  </app-button>
                  <app-button
                    variant="secondary"
                    (onClick)="resetForm()"
                  >
                    Clear
                  </app-button>
                </div>
              </form>
            </div>
          </app-card>
        </div>
      </div>
    </div>
  `
})
export class StockMovementComponent {
  private transactionService = inject(TransactionService);
  private batchService = inject(BatchService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  types: TransactionType[] = ['IN', 'OUT', 'RETURN'];
  currentType = signal<TransactionType>('IN');

  form = new FormGroup({
    quantity: new FormControl('', [
      Validators.required,
      Validators.min(1)
    ]),

    reason: new FormControl('')
  });

  batchLookup = new FormControl('');
  selectedBatch = signal<Batch | null>(null);
  suggestions = signal<Batch[]>([]);
  showSuggestions = signal(false);
  submitting = signal(false);

  constructor() {
    this.setupAutocomplete();
  }

  private setupAutocomplete() {
    this.batchLookup.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(query => {
        if (query && query.length >= 2) {
          this.batchService.search(query).subscribe({
            next: (batches: Batch[]) => {
              this.suggestions.set(batches || []);
              this.showSuggestions.set(true);
            },
            error: () => {
              this.suggestions.set([]);
              this.showSuggestions.set(false);
            }
          });
        } else {
          this.suggestions.set([]);
          this.showSuggestions.set(false);
        }
      });
  }

  selectType(type: TransactionType) {
    this.currentType.set(type);
  }

  selectBatch(batch: Batch) {
    this.selectedBatch.set(batch);
    this.batchLookup.setValue(batch.lotNumber, { emitEvent: false });
    this.showSuggestions.set(false);
  }

  viewAllResults() {
    const query = this.batchLookup.value;
    if (query) {
      this.router.navigate(['/batches'], { queryParams: { q: query } });
    }
  }

  submit() {
    if (!this.form.valid || !this.selectedBatch()) {
      this.toastService.warning('Select batch and enter quantity');
      return;
    }

    this.submitting.set(true);
    const payload = {
      type: this.currentType(),
      batchId: this.selectedBatch()!.id,
      quantity: Number(this.form.get('quantity')?.value),
      reason: this.form.get('reason')?.value || undefined
    };

    this.transactionService.record(payload).subscribe({
      next: () => {
        this.toastService.success('Transaction recorded');
        this.resetForm();
        this.submitting.set(false);
      },
      error: () => {
        this.toastService.error('Failed to record transaction');
        this.submitting.set(false);
      }
    });
  }

  resetForm() {
    this.form.reset();
    this.batchLookup.reset();
    this.selectedBatch.set(null);
    this.suggestions.set([]);
    this.showSuggestions.set(false);
    this.currentType.set('IN');
  }
}
