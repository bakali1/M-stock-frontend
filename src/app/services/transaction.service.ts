import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Transaction } from '../models/transaction.model';

export interface TransactionRecordRequest {
  type: 'IN' | 'OUT' | 'RETURN';
  quantity: number;
  batchId: number;
  reason?: string;
  userId?: number;
  skipQuantityUpdate?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private api = inject(ApiService);
  record(transaction: TransactionRecordRequest): Observable<Transaction> {
    return this.api.post<Transaction>('/transactions', transaction).pipe(
      map(response => response.data),
      catchError(error => {
        // handle or rethrow
        return throwError(() => new Error(`Failed to record transaction: ${error.message}`));
      })
    );
  }

  getByBatch(batchId: number): Observable<Transaction[]> {
    return this.api.get<Transaction[]>(`/transactions/batch/${batchId}`).pipe(
      map(response => response.data)
    );
  }

  getRecent(): Observable<Transaction[]> {
    return this.api.get<Transaction[]>('/transactions').pipe(
      map(response => response.data)
    );
  }
}
