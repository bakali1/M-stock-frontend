import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../../../components/spinner/spinner.component';
import { CardComponent } from '../../../components/card/card.component';
import { BatchService } from '../../../services/batch.service';
import { ToastService } from '../../../services/toast.service';
import { getAlertStatus, getAlertBadgeColor, formatExpiryStatus } from '../../../utils/alerts.util';
import { Batch } from '../../../models/batch.model';

@Component({
  selector: 'app-expiration-alerts',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, CardComponent],
  template: `
    <app-card>
      <div class="p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Expiration Alerts</h3>
        
        @if (loading()) {
          <div class="flex justify-center py-8">
            <app-spinner label="Loading alerts..."></app-spinner>
          </div>
        } @else if (alerts().length === 0) {
          <div class="text-center py-8 text-gray-500">
            <p>No expiration alerts</p>
          </div>
        } @else {
          <div class="space-y-3">
            @for (batch of alerts(); track batch.id) {
              <div [class]="'p-3 rounded-lg border ' + getAlertClass(batch)">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-semibold text-sm">{{ batch.productName }}</p>
                    <p class="text-xs text-gray-600">Lot: {{ batch.lotNumber }}</p>
                  </div>
                  <span [class]="'px-2 py-1 rounded text-xs font-semibold ' + getAlertBadgeColor(batch.expirationAlertLevel)">
                    {{ batch.expirationAlertLevel }}
                  </span>
                </div>
                <p class="text-xs mt-2">{{ formatExpiryStatus(batch.expirationDate) }}</p>
              </div>
            }
          </div>
        }
      </div>
    </app-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpirationAlertsComponent implements OnInit {
  private batchService = inject(BatchService);
  private toastService = inject(ToastService);

  alerts = signal<Batch[]>([]);
  loading = signal(false);

  getAlertStatus = getAlertStatus;
  getAlertBadgeColor = getAlertBadgeColor;
  formatExpiryStatus = formatExpiryStatus;

  ngOnInit() {
    this.loadAlerts();
  }

  private loadAlerts() {
    this.loading.set(true);
    this.batchService.getAlerts().subscribe({
      next: (batches: Batch[]) => {
        this.alerts.set(batches || []);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.toastService.error('Failed to load expiration alerts');
        this.loading.set(false);
      }
    });
  }

  getAlertClass(batch: Batch): string {
    const status = batch.expirationAlertLevel;
    const classes: Record<string, string> = {
      CRITICAL: 'bg-red-50 border-red-200',
      ATTENTION: 'bg-orange-50 border-orange-200',
      NORMAL: 'bg-green-50 border-green-200',
      EXPIRED: 'bg-gray-50 border-gray-200'
    };
    return classes[status];
  }
}
