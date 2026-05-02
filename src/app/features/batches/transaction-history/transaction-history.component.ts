import { Component, ChangeDetectionStrategy, input, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../../../components/spinner/spinner.component';
import { TransactionService } from '../../../services/transaction.service';
import { ToastService } from '../../../services/toast.service';
import { Transaction } from '../../../models/transaction.model';
import { formatDateTime } from '../../../utils/date.util';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  template: `
    <div>
      <h4 class="text-lg font-semibold text-gray-900 mb-4">Transaction History</h4>
      
      @if (loading()) {
        <div class="flex justify-center py-8">
          <app-spinner label="Loading history..."></app-spinner>
        </div>
      } @else if (transactions().length === 0) {
        <div class="text-center py-8 text-gray-500">
          <p>No transactions</p>
        </div>
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-100 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Quantity</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reason</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
              </tr>
            </thead>
            <tbody>
              @for (txn of transactions(); track txn.id) {
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-6 py-3 text-sm">
                    <span [class]="getTxnBadgeClass(txn.type)">{{ txn.type }}</span>
                  </td>
                  <td class="px-6 py-3 text-sm text-gray-700">{{ txn.quantity }}</td>
                  <td class="px-6 py-3 text-sm text-gray-700">{{ txn.reason || '-' }}</td>
                  <td class="px-6 py-3 text-sm text-gray-700">{{ formatDateTime(txn.createdAt) }}</td>
                  <td class="px-6 py-3 text-sm text-gray-700">{{ txn.userName || '-' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionHistoryComponent implements OnInit {
  batchId = input.required<number>();

  private transactionService = inject(TransactionService);
  private toastService = inject(ToastService);

  transactions = signal<Transaction[]>([]);
  loading = signal(false);

  formatDateTime = formatDateTime;

  ngOnInit() {
    this.loadHistory();
  }

  private loadHistory() {
    this.loading.set(true);
    this.transactionService.getByBatch(this.batchId()).subscribe({
      next: (txns: Transaction[]) => {
        this.transactions.set(txns || []);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.toastService.error('Failed to load transaction history');
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
