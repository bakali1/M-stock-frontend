import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { TransactionRecordRequest, TransactionService } from '../../services/transaction.service';
import { BatchService } from '../../services/batch.service';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';

import { CardComponent } from '../../components/card/card.component';
import { ButtonComponent } from '../../components/button/button.component';

import { Batch } from '../../models/batch.model';
import { Product } from '../../models/product.model';
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

                @if (currentType() === 'IN') {
                  <div class="mb-6">
                    <label class="block text-sm font-medium text-[var(--app-text-primary)] mb-2">
                      Batch Mode
                    </label>
                    <div class="flex flex-wrap gap-2">
                      <button
                        type="button"
                        (click)="setInMode('existing')"
                        [attr.aria-pressed]="inMode() === 'existing'"
                        class="px-4 py-2 rounded-lg font-medium transition"
                        [class.bg-[var(--app-brand)]]="inMode() === 'existing'"
                        [class.text-[var(--app-on-brand)]]="inMode() === 'existing'"
                        [class.bg-[var(--app-surface-muted)]]="inMode() !== 'existing'"
                        [class.text-[var(--app-text-secondary)]]="inMode() !== 'existing'"
                        [class.hover\:bg-[var(--app-hover)]]="inMode() !== 'existing'"
                      >
                        Existing Batch
                      </button>
                      <button
                        type="button"
                        (click)="setInMode('new')"
                        [attr.aria-pressed]="inMode() === 'new'"
                        class="px-4 py-2 rounded-lg font-medium transition"
                        [class.bg-[var(--app-brand)]]="inMode() === 'new'"
                        [class.text-[var(--app-on-brand)]]="inMode() === 'new'"
                        [class.bg-[var(--app-surface-muted)]]="inMode() !== 'new'"
                        [class.text-[var(--app-text-secondary)]]="inMode() !== 'new'"
                        [class.hover\:bg-[var(--app-hover)]]="inMode() !== 'new'"
                      >
                        New Batch
                      </button>
                    </div>
                  </div>
                }

                @if (showBatchLookup()) {
                  <div class="mb-6">
                    <label
                      class="block text-sm font-medium text-[var(--app-text-primary)] mb-2"
                      for="batch-lookup"
                    >
                      Batch / NSN
                    </label>

                    <div class="relative">
                      <input
                        type="text"
                        id="batch-lookup"
                        [formControl]="batchLookup"
                        placeholder="Search by lot number or NSN..."
                        autocomplete="off"
                        class="w-full px-4 py-2 border border-[var(--app-border-strong)] rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-[var(--app-brand)]
                               bg-[var(--app-surface)] text-[var(--app-text-primary)]"
                      />

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
                }

                @if (showNewBatchForm()) {
                  <div class="mb-6" [formGroup]="batchForm">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-[var(--app-text-primary)] mb-2" for="product-lookup">
                          Product
                        </label>
                        <div class="relative">
                          <input
                            type="text"
                            id="product-lookup"
                            [formControl]="productLookup"
                            placeholder="Search products by name or NSN..."
                            autocomplete="off"
                            class="w-full px-4 py-2 border border-[var(--app-border-strong)] rounded-lg
                                   focus:outline-none focus:ring-2 focus:ring-[var(--app-brand)]
                                   bg-[var(--app-surface)] text-[var(--app-text-primary)]"
                          />

                          @if (productSuggestions().length > 0 && showProductSuggestions()) {
                            <div
                              class="absolute top-full left-0 right-0 z-10
                                     bg-[var(--app-surface)]
                                     border border-[var(--app-border-strong)]
                                     rounded-b-lg shadow-lg
                                     max-h-64 overflow-y-auto"
                            >
                              @for (product of productSuggestions(); track product.id) {
                                <button
                                  type="button"
                                  (click)="selectProduct(product)"
                                  class="w-full text-left px-4 py-2
                                         hover:bg-[var(--app-sidebar-active)]
                                         border-b border-[var(--app-border)]"
                                >
                                  <p class="font-semibold text-sm">
                                    {{ product.name }}
                                  </p>
                                  <p class="text-xs text-[var(--app-text-secondary)]">
                                    {{ product.nsnCode }}
                                  </p>
                                </button>
                              }
                            </div>
                          }
                        </div>

                        @if (selectedProduct(); as product) {
                          <div
                            class="mt-3 p-3 rounded-lg
                                   bg-[var(--app-info-muted)]
                                   border border-[var(--app-border)]"
                          >
                            <p class="text-sm font-semibold text-[var(--app-text-primary)]">
                              {{ product.name }}
                            </p>
                            <p class="text-xs text-[var(--app-text-secondary)]">
                              NSN: {{ product.nsnCode }}
                            </p>
                          </div>
                        }

                        @if (productIdInvalid()) {
                          <p class="text-[var(--app-danger)] text-sm mt-1">
                            Product is required
                          </p>
                        }
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-[var(--app-text-primary)] mb-2" for="lot-number">
                          Lot Number
                        </label>
                        <input
                          type="text"
                          id="lot-number"
                          formControlName="lotNumber"
                          placeholder="Enter lot number"
                          class="w-full px-4 py-2 border border-[var(--app-border-strong)] rounded-lg
                                 focus:outline-none focus:ring-2 focus:ring-[var(--app-brand)]
                                 bg-[var(--app-surface)] text-[var(--app-text-primary)]"
                        />
                        @if (lotNumberInvalid()) {
                          <p class="text-[var(--app-danger)] text-sm mt-1">
                            Lot number required
                          </p>
                        }
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-[var(--app-text-primary)] mb-2" for="expiration-date">
                          Expiration Date
                        </label>
                        <input
                          type="datetime-local"
                          id="expiration-date"
                          formControlName="expirationDate"
                          class="w-full px-4 py-2 border border-[var(--app-border-strong)] rounded-lg
                                 focus:outline-none focus:ring-2 focus:ring-[var(--app-brand)]
                                 bg-[var(--app-surface)] text-[var(--app-text-primary)]"
                        />
                        @if (expirationDateInvalid()) {
                          <p class="text-[var(--app-danger)] text-sm mt-1">
                            Expiration date required
                          </p>
                        }
                      </div>

                      <div>
                        <label class="block text-sm font-medium text-[var(--app-text-primary)] mb-2" for="batch-location">
                          Location
                        </label>
                        <input
                          type="text"
                          id="batch-location"
                          formControlName="location"
                          placeholder="Zone-A/Bin-1"
                          class="w-full px-4 py-2 border border-[var(--app-border-strong)] rounded-lg
                                 focus:outline-none focus:ring-2 focus:ring-[var(--app-brand)]
                                 bg-[var(--app-surface)] text-[var(--app-text-primary)]"
                        />
                        @if (locationInvalid()) {
                          <p class="text-[var(--app-danger)] text-sm mt-1">
                            Location required
                          </p>
                        }
                      </div>

                    </div>
                  </div>
                }

                <!-- Quantity -->
                <div class="mb-6">
                  <label
                    class="block text-sm font-medium text-[var(--app-text-primary)] mb-2"
                    for="movement-quantity"
                  >
                    Quantity
                  </label>

                  <input
                    type="number"
                    id="movement-quantity"
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
                    for="movement-reason"
                  >
                    Reason (Optional)
                  </label>

                  <textarea
                    id="movement-reason"
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
                     [disabled]="!canSubmit()"
                     [loading]="submitting()"
                   >
                     {{ submitLabel() }}
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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockMovementComponent {
  private transactionService = inject(TransactionService);
  private batchService = inject(BatchService);
  private productService = inject(ProductService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  types: TransactionType[] = ['IN', 'OUT', 'RETURN'];
  currentType = signal<TransactionType>('IN');
  inMode = signal<'existing' | 'new'>('existing');

  showBatchLookup = computed(() => this.currentType() !== 'IN' || this.inMode() === 'existing');
  showNewBatchForm = computed(() => this.currentType() === 'IN' && this.inMode() === 'new');
  submitLabel = computed(() => this.showNewBatchForm() ? 'Create Batch' : 'Record Movement');

  form = new FormGroup({
    quantity: new FormControl('', [
      Validators.required,
      Validators.min(1)
    ]),

    reason: new FormControl('')
  });

  batchForm = new FormGroup({
    productId: new FormControl<number | null>(null, Validators.required),
    lotNumber: new FormControl('', Validators.required),
    expirationDate: new FormControl('', Validators.required),
    location: new FormControl('', Validators.required)
  });

  batchLookup = new FormControl('');
  selectedBatch = signal<Batch | null>(null);
  suggestions = signal<Batch[]>([]);
  showSuggestions = signal(false);

  productLookup = new FormControl('');
  selectedProduct = signal<Product | null>(null);
  productSuggestions = signal<Product[]>([]);
  showProductSuggestions = signal(false);

  submitting = signal(false);

  constructor() {
    this.setupAutocomplete();
    this.setupProductAutocomplete();
    this.setupModeSync();
  }

  private setupModeSync() {
    effect(() => {
      if (this.currentType() !== 'IN' && this.inMode() !== 'existing') {
        this.inMode.set('existing');
      }
    });
  }

  private setupAutocomplete() {
    this.batchLookup.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(query => {
        if (query) {
          this.selectedBatch.set(null);
        }
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

  private setupProductAutocomplete() {
    this.productLookup.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(query => {
        if (query) {
          this.selectedProduct.set(null);
          this.batchForm.patchValue({ productId: null }, { emitEvent: false });
        }
        if (query && query.length >= 2) {
          this.productService.search(query).subscribe({
            next: (products: Product[]) => {
              this.productSuggestions.set(products || []);
              this.showProductSuggestions.set(true);
            },
            error: () => {
              this.productSuggestions.set([]);
              this.showProductSuggestions.set(false);
            }
          });
        } else {
          this.productSuggestions.set([]);
          this.showProductSuggestions.set(false);
        }
      });
  }

  selectType(type: TransactionType) {
    this.currentType.set(type);
    if (type !== 'IN') {
      this.setInMode('existing');
    }
  }

  setInMode(mode: 'existing' | 'new') {
    this.inMode.set(mode);
    if (mode === 'new') {
      this.clearBatchSelection();
    } else {
      this.clearNewBatchForm();
    }
  }

  selectBatch(batch: Batch) {
    this.selectedBatch.set(batch);
    this.batchLookup.setValue(batch.lotNumber, { emitEvent: false });
    this.showSuggestions.set(false);
  }

  selectProduct(product: Product) {
    this.selectedProduct.set(product);
    this.batchForm.patchValue({ productId: product.id });
    this.productLookup.setValue(`${product.name} (${product.nsnCode})`, { emitEvent: false });
    this.showProductSuggestions.set(false);
  }

  viewAllResults() {
    const query = this.batchLookup.value;
    if (query) {
      this.router.navigate(['/batches'], { queryParams: { q: query } });
    }
  }

  submit() {
    this.form.markAllAsTouched();

    if (this.showNewBatchForm()) {
      this.batchForm.markAllAsTouched();
    }

    if (!this.canSubmit()) {
      this.toastService.warning('Complete required fields before submitting');
      return;
    }

    this.submitting.set(true);

    if (this.showNewBatchForm()) {
      const batchPayload = this.buildBatchPayload();
      this.batchService.create(batchPayload).subscribe({
        next: (batch: Batch) => {
          this.recordTransaction(batch.id, true);
        },
        error: () => {
          this.toastService.error('Failed to create batch');
          this.submitting.set(false);
        }
      });
      return;
    }

    if (!this.selectedBatch()) {
      this.toastService.warning('Select a batch first');
      this.submitting.set(false);
      return;
    }

    this.recordTransaction(this.selectedBatch()!.id, false);
  }

  private recordTransaction(batchId: number, skipQuantityUpdate: boolean) {
    const payload: TransactionRecordRequest = {
      type: this.currentType(),
      batchId,
      quantity: Number(this.form.get('quantity')?.value),
      reason: this.form.get('reason')?.value || undefined,
      ...(skipQuantityUpdate ? { skipQuantityUpdate } : {})
    };

    this.transactionService.record(payload).subscribe({
      next: () => {
        if (this.showNewBatchForm()) {
          this.toastService.success('Batch created and transaction recorded');
        } else {
          this.toastService.success('Transaction recorded');
        }
        this.resetForm();
        this.submitting.set(false);
      },
      error: () => {
        this.toastService.error('Failed to record transaction');
        this.submitting.set(false);
      }
    });
  }

  private buildBatchPayload() {
    const val = this.batchForm.value;
    return {
      lotNumber: val.lotNumber?.trim(),
      quantity: Number(this.form.get('quantity')?.value),
      expirationDate: val.expirationDate || undefined,
      location: val.location?.trim(),
      productId: Number(val.productId)
    };
  }

  resetForm() {
    this.form.reset();
    this.batchLookup.reset();
    this.clearBatchSelection();
    this.clearNewBatchForm();
    this.suggestions.set([]);
    this.showSuggestions.set(false);
    this.currentType.set('IN');
    this.inMode.set('existing');
  }

  private clearBatchSelection() {
    this.selectedBatch.set(null);
    this.batchLookup.reset('', { emitEvent: false });
  }

  private clearNewBatchForm() {
    this.batchForm.reset();
    this.productLookup.reset('', { emitEvent: false });
    this.selectedProduct.set(null);
    this.productSuggestions.set([]);
    this.showProductSuggestions.set(false);
  }

  canSubmit() {
    if (this.submitting()) return false;
    if (!this.form.valid) return false;
    if (this.showNewBatchForm()) return this.batchForm.valid;
    return !!this.selectedBatch();
  }

  productIdInvalid() {
    const c = this.batchForm.get('productId');
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  lotNumberInvalid() {
    const c = this.batchForm.get('lotNumber');
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  expirationDateInvalid() {
    const c = this.batchForm.get('expirationDate');
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  locationInvalid() {
    const c = this.batchForm.get('location');
    return !!c && c.invalid && (c.dirty || c.touched);
  }

}
