import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../../../components/spinner/spinner.component';
import { CardComponent } from '../../../components/card/card.component';
import { TransactionService } from '../../../services/transaction.service';
import { ToastService } from '../../../services/toast.service';
import { Transaction } from '../../../models/transaction.model';
import { formatDateTime } from '../../../utils/date.util';

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, CardComponent],
  template: `
    <app-card>
      <div class="p-6 h-[calc(100vh-16rem)]">
        <h3 class="text-lg font-semibold text-[var(--app-text-primary)] mb-4">Recent Activity</h3>
        
        @if (loading()) {
          <div class="flex justify-center py-8">
            <app-spinner label="Loading activity..."></app-spinner>
          </div>
        } @else if (transactions().length === 0) {
          <div class="text-center py-8 text-[var(--app-text-muted)]">
            <p>No recent activity</p>
          </div>
        } @else {
          <div class="space-y-3 max-h-[calc(100vh-22rem)] overflow-y-auto">
            @for (txn of [...transactions()].reverse(); track txn.id) {
              <div class="p-3 border-l-4 rounded-r-lg border-[var(--app-border-strong)] hover:bg-[var(--app-surface-alt)] transition">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <p class="text-sm font-semibold">
                      <span [class]="getTxnBadgeClass(txn.type)">{{ txn.type }}</span>
                    </p>
                    <p class="text-xs text-[var(--app-text-secondary)] mt-1">{{ txn.productName }}</p>
                    <p class="text-xs text-[var(--app-text-muted)]">Lot: {{ txn.lotNumber }} | Qty: {{ txn.quantity }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-semibold text-[var(--app-text-primary)]">{{ txn.userName }}</p>
                    <p class="text-xs text-[var(--app-text-muted)]">{{ formatDateTime(txn.createdAt) }}</p>
                  </div>
                </div>
                @if (txn.reason) {
                  <p class="text-xs text-[var(--app-text-secondary)] mt-2">{{ txn.reason }}</p>
                }
              </div>
            }
          </div>
        }
      </div>
    </app-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecentActivityComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private toastService = inject(ToastService);

  transactions = signal<Transaction[]>([]);
  loading = signal(false);

  formatDateTime = formatDateTime;

  ngOnInit() {
    this.loadTransactions();
  }

  private loadTransactions() {
    this.loading.set(true);
    this.transactionService.getRecent().subscribe({
      next: (txns: Transaction[]) => {
        this.transactions.set(txns || []);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.toastService.error('Failed to load recent activity');
        this.loading.set(false);
      }
    });
  }

  getTxnBadgeClass(type: string): string {
    const classes: Record<string, string> = {
      IN: 'bg-[var(--app-success-muted)] text-[var(--app-success-strong)] px-2 py-1 rounded text-xs font-semibold',
      OUT: 'bg-[var(--app-info-muted)] text-[var(--app-info-strong)] px-2 py-1 rounded text-xs font-semibold',
      RETURN: 'bg-[var(--app-warning-muted)] text-[var(--app-warning-strong)] px-2 py-1 rounded text-xs font-semibold'
    };
    return classes[type] || classes['IN'];
  }
}
