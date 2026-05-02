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
      <div class="p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        
        @if (loading()) {
          <div class="flex justify-center py-8">
            <app-spinner label="Loading activity..."></app-spinner>
          </div>
        } @else if (transactions().length === 0) {
          <div class="text-center py-8 text-gray-500">
            <p>No recent activity</p>
          </div>
        } @else {
          <div class="space-y-3 max-h-96 overflow-y-auto">
            @for (txn of transactions(); track txn.id) {
              <div class="p-3 border-l-4 rounded-r-lg border-gray-300 hover:bg-gray-50 transition">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <p class="text-sm font-semibold">
                      <span [class]="getTxnBadgeClass(txn.type)">{{ txn.type }}</span>
                    </p>
                    <p class="text-xs text-gray-600 mt-1">{{ txn.productName }}</p>
                    <p class="text-xs text-gray-500">Lot: {{ txn.lotNumber }} | Qty: {{ txn.quantity }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-semibold text-gray-900">{{ txn.userName }}</p>
                    <p class="text-xs text-gray-500">{{ formatDateTime(txn.createdAt) }}</p>
                  </div>
                </div>
                @if (txn.reason) {
                  <p class="text-xs text-gray-600 mt-2">{{ txn.reason }}</p>
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
      IN: 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold',
      OUT: 'bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold',
      RETURN: 'bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-semibold'
    };
    return classes[type] || classes['IN'];
  }
}
