import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { BatchService } from '../../services/batch.service';
import { ToastService } from '../../services/toast.service';
import { CardComponent } from '../../components/card/card.component';
import { ButtonComponent } from '../../components/button/button.component';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { BatchDetailModalComponent } from './batch-detail-modal.component';
import { Batch } from '../../models/batch.model';
import { getAlertStatus, getAlertBadgeColor } from '../../utils/alerts.util';

@Component({
  selector: 'app-batch-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    ButtonComponent,
    SpinnerComponent,
    BatchDetailModalComponent
  ],
  template: `
    <div class="p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Batch Search</h1>

      <app-card>
        <div class="p-6 border-b border-gray-200">
          <div class="flex gap-3">
            <input
              [formControl]="searchControl"
              type="text"
              placeholder="Search by lot number or NSN..."
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search batches"
            />
            <app-button (onClick)="search()" [loading]="searching()">Search</app-button>
          </div>
        </div>

        <div class="p-6">
          @if (loading()) {
            <div class="flex justify-center py-8">
              <app-spinner label="Loading results..."></app-spinner>
            </div>
          } @else if (batches().length === 0 && searched()) {
            <div class="text-center py-8 text-gray-500">
              <p>No batches found</p>
            </div>
          } @else if (batches().length > 0) {
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Lot Number</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">NSN Code</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Quantity</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Expiration</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  @for (batch of batches(); track batch.id) {
                    <tr class="border-b border-gray-200 hover:bg-gray-50">
                      <td class="px-6 py-3 text-sm text-gray-700">{{ batch.productName }}</td>
                      <td class="px-6 py-3 text-sm text-gray-700">{{ batch.lotNumber }}</td>
                      <td class="px-6 py-3 text-sm text-gray-700">{{ batch.nsnCode }}</td>
                      <td class="px-6 py-3 text-sm text-gray-700">{{ batch.quantity }}</td>
                      <td class="px-6 py-3 text-sm">
                        <span [class]="getStatusBadge(batch.status)">{{ batch.status }}</span>
                      </td>
                      <td class="px-6 py-3 text-sm">
                        <span [class]="'px-2 py-1 rounded text-xs font-semibold ' + getAlertBadgeColor(batch.expirationAlertLevel)">
                          {{ batch.expirationAlertLevel }}
                        </span>
                      </td>
                      <td class="px-6 py-3 text-sm">
                        <button
                          (click)="openDetail(batch.id)"
                          class="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </app-card>
    </div>

    @if (selectedBatchId()) {
      <app-batch-detail-modal
        [batchId]="selectedBatchId()!"
        [showModal]="true"
        (onClose)="closeDetail()"
      ></app-batch-detail-modal>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BatchSearchComponent implements OnInit {
  private batchService = inject(BatchService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  searchControl = new FormControl('');
  batches = signal<Batch[]>([]);
  loading = signal(false);
  searching = signal(false);
  searched = signal(false);
  selectedBatchId = signal<number | null>(null);

  getAlertStatus = getAlertStatus;
  getAlertBadgeColor = getAlertBadgeColor;

  ngOnInit() {
    this.setupSearch();
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchControl.setValue(params['q']);
        this.search();
      }
    });
  }

  private setupSearch() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        if (this.searchControl.value && this.searchControl.value.length >= 2) {
          this.search();
        }
      });
  }

  search() {
    const query = this.searchControl.value?.trim();
    if (!query || query.length < 2) {
      this.toastService.warning('Enter at least 2 characters');
      return;
    }

    this.searching.set(true);
    this.loading.set(true);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: query },
      queryParamsHandling: 'merge'
    });

    this.batchService.search(query).subscribe({
      next: (batches: Batch[]) => {
        this.batches.set(batches || []);
        this.searched.set(true);
        this.loading.set(false);
        this.searching.set(false);
      },
      error: (err: unknown) => {
        this.toastService.error('Search failed');
        this.loading.set(false);
        this.searching.set(false);
      }
    });
  }

  openDetail(batchId: number) {
    this.selectedBatchId.set(batchId);
  }

  closeDetail() {
    this.selectedBatchId.set(null);
  }

  getStatusBadge(status: string): string {
    const classes: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold',
      QUARANTINE: 'bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold',
      RETIRED: 'bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-semibold'
    };
    return classes[status] || classes['ACTIVE'];
  }
}

