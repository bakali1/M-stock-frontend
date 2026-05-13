import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Batch } from '../../../models/batch.model';
import { CardComponent } from '../../../components/card/card.component';
import { getAlertStatus, getAlertBadgeColor, formatExpiryStatus } from '../../../utils/alerts.util';
import { formatDate } from '../../../utils/date.util';
import { TransactionHistoryComponent } from '../transaction-history/transaction-history.component';

@Component({
  selector: 'app-batch-detail',
  standalone: true,
  imports: [CommonModule, CardComponent, TransactionHistoryComponent],
  template: `
    <div class="space-y-6">
      <app-card>
        <div class="p-6">
          <div class="grid grid-cols-2 gap-6">
            <div>
              <p class="text-sm text-[var(--app-text-muted)] mb-1">Product</p>
              <p class="text-lg font-semibold text-[var(--app-text-primary)]">{{ batch().productName }}</p>
            </div>
            <div>
              <p class="text-sm text-[var(--app-text-muted)] mb-1">NSN Code</p>
              <p class="text-lg font-semibold text-[var(--app-text-primary)]">{{ batch().nsnCode }}</p>
            </div>
            <div>
              <p class="text-sm text-[var(--app-text-muted)] mb-1">Lot Number</p>
              <p class="text-lg font-semibold text-[var(--app-text-primary)]">{{ batch().lotNumber }}</p>
            </div>
            <div>
              <p class="text-sm text-[var(--app-text-muted)] mb-1">Current Quantity</p>
              <p class="text-lg font-semibold text-[var(--app-text-primary)]">{{ batch().quantity }}</p>
            </div>
            <div>
              <p class="text-sm text-[var(--app-text-muted)] mb-1">Location</p>
              <p class="text-lg font-semibold text-[var(--app-text-primary)]">{{ batch().location }}</p>
            </div>
            <div>
              <p class="text-sm text-[var(--app-text-muted)] mb-1">Status</p>
              <span [class]="getStatusBadge(batch().status)">{{ batch().status }}</span>
            </div>
            <div>
              <p class="text-sm text-[var(--app-text-muted)] mb-1">Expiration</p>
              <p class="text-lg font-semibold text-[var(--app-text-primary)]">{{ formatDate(batch().expirationDate) }}</p>
              <p [class]="'text-sm mt-1 ' + getAlertBadgeColor(getAlertStatus(batch().expirationDate))">
                {{ formatExpiryStatus(batch().expirationDate) }}
              </p>
            </div>
            <div>
              <p class="text-sm text-[var(--app-text-muted)] mb-1">Days Until Expiration</p>
              <p class="text-lg font-semibold text-[var(--app-text-primary)]">{{ batch().daysUntilExpiration }}</p>
              <p class="text-sm mt-1 text-[var(--app-text-secondary)]">{{ formatExpiryStatus(batch().expirationDate) }}</p>
            </div>
          </div>
        </div>
      </app-card>

      <app-card>
        <div class="p-6">
          <app-transaction-history [batchId]="batch().id"></app-transaction-history>
        </div>
      </app-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BatchDetailComponent {
  batch = input.required<Batch>();

  getAlertStatus = getAlertStatus;
  getAlertBadgeColor = getAlertBadgeColor;
  formatExpiryStatus = formatExpiryStatus;
  formatDate = formatDate;

  getStatusBadge(status: string): string {
    const classes: Record<string, string> = {
      ACTIVE: 'bg-[var(--app-success-muted)] text-[var(--app-success-strong)] px-3 py-1 rounded-full text-sm font-semibold',
      QUARANTINE: 'bg-[var(--app-danger-muted)] text-[var(--app-danger-strong)] px-3 py-1 rounded-full text-sm font-semibold',
      RETIRED: 'bg-[var(--app-neutral-muted)] text-[var(--app-neutral-strong)] px-3 py-1 rounded-full text-sm font-semibold'
    };
    return classes[status] || classes['ACTIVE'];
  }
}
