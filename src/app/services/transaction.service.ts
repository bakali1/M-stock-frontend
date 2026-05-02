import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Transaction } from '../models/transaction.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private api = inject(ApiService);
  private auth = inject(AuthService)
  record(transaction: Partial<Transaction>): Observable<Transaction> {
    const user = this.auth.currentUser();   // call the function
    if (!user?.id) {
      throw new Error('User not authenticated or missing id');
    }
    const payload = { ...transaction, userId: user.id };
    return this.api.post<Transaction>('/transactions', payload).pipe(
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
