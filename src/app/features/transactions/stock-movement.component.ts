import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
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
  imports: [CommonModule, ReactiveFormsModule, CardComponent, ButtonComponent],
  template: `
    <div class="p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Stock Movement</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Tabs -->
        <div class="lg:col-span-1">
          <div class="space-y-2">
            @for (type of types; track type) {
              <button
                (click)="selectType(type)"
                [class]="getTabClass(type)"
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
              <form [formGroup]="form" (ngSubmit)="submit()">
                <!-- Type (hidden, set via tabs) -->
                <input type="hidden" [value]="currentType" />

                <!-- Batch Lookup with Autocomplete -->
                <div class="mb-6">
                  <label class="block text-sm font-medium text-gray-900 mb-2">Batch / NSN</label>
                  <div class="relative">
                    <input
                      type="text"
                      [formControl]="batchLookup"
                      placeholder="Search by lot number or NSN..."
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autocomplete="off"
                    />
                    
                    <!-- Autocomplete Dropdown -->
                    @if (suggestions().length > 0 && showSuggestions()) {
                      <div class="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                        @for (batch of suggestions(); track batch.id) {
                          <button
                            type="button"
                            (click)="selectBatch(batch)"
                            class="w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-100"
                          >
                            <p class="font-semibold text-sm">{{ batch.lotNumber }}</p>
                            <p class="text-xs text-gray-600">{{ batch.productName }} ({{ batch.nsnCode }})</p>
                          </button>
                        }
                      </div>
                    }
                  </div>
                  
                  <!-- Selected Batch Display -->
                  @if (selectedBatch(); as batch) {
                    <div class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p class="text-sm font-semibold text-gray-900">{{ batch.productName }}</p>
                      <p class="text-xs text-gray-600">Lot: {{ batch.lotNumber }}</p>
                      <p class="text-xs text-gray-600">Current: {{ batch.quantity }} units</p>
                    </div>
                  }

                  <!-- View All Results Link -->
                  @if (batchLookup.value) {
                    <p class="text-xs mt-2">
                      <button
                        type="button"
                        (click)="viewAllResults()"
                        class="text-blue-600 hover:underline"
                      >
                        View all results for "{{ batchLookup.value }}"
                      </button>
                    </p>
                  }
                </div>

                <!-- Quantity -->
                <div class="mb-6">
                  <label class="block text-sm font-medium text-gray-900 mb-2">Quantity</label>
                  <input
                    type="number"
                    formControlName="quantity"
                    placeholder="Enter quantity"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                  @if (form.get('quantity')?.errors?.['required'] && form.get('quantity')?.touched) {
                    <p class="text-red-600 text-sm mt-1">Quantity required</p>
                  }
                  @if (form.get('quantity')?.errors?.['min'] && form.get('quantity')?.touched) {
                    <p class="text-red-600 text-sm mt-1">Quantity must be > 0</p>
                  }
                </div>

                <!-- Reason -->
                <div class="mb-8">
                  <label class="block text-sm font-medium text-gray-900 mb-2">Reason (Optional)</label>
                  <textarea
                    formControlName="reason"
                    placeholder="Enter reason for this movement..."
                    rows="3"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <!-- Submit -->
                <div class="flex gap-3">
                  <app-button type="submit" [disabled]="!form.valid || submitting()" [loading]="submitting()">
                    Record Movement
                  </app-button>
                  <app-button variant="secondary" (onClick)="resetForm()">
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
  private toastService = inject(ToastService);
  private router = inject(Router);

  types: TransactionType[] = ['IN', 'OUT', 'RETURN'];
  currentType: TransactionType = 'IN';

  form = new FormGroup({
    quantity: new FormControl('', [Validators.required, Validators.min(1)])
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
            error: () => this.suggestions.set([])
          });
        } else {
          this.suggestions.set([]);
          this.showSuggestions.set(false);
        }
      });
  }

  selectType(type: TransactionType) {
    this.currentType = type;
  }

  selectBatch(batch: Batch) {
    this.selectedBatch.set(batch);
    this.batchLookup.setValue(batch.lotNumber);
    this.showSuggestions.set(false);
  }

  viewAllResults() {
    const query = this.batchLookup.value;
    if (query) {
      this.router.navigate(['/batches'], { queryParams: { q: query } });
    }
  }

  getTabClass(type: string): string {
    const isActive = this.currentType === type;
    return `w-full px-4 py-2 rounded-lg font-medium transition ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`;
  }

  submit() {
    if (!this.form.valid || !this.selectedBatch()) {
      this.toastService.warning('Select batch and enter quantity');
      return;
    }

    this.submitting.set(true);
     const payload = {
       type: this.currentType,
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
      error: (err: unknown) => {
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
    this.currentType = 'IN';
  }
}
