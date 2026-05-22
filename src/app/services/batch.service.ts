import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService, ApiResponse } from './api.service';
import { Batch } from '../models/batch.model';

@Injectable({
  providedIn: 'root'
})
export class BatchService {
  private api = inject(ApiService);

  search(query: string): Observable<Batch[]> {
    return this.api.get<Batch[]>(`/batches/search?key=${encodeURIComponent(query)}`).pipe(
      map(response => response.data)
    );
  }

  getById(id: number): Observable<Batch> {
    return this.api.get<Batch>(`/batches/${id}`).pipe(
      map(response => response.data)
    );
  }

  getAlerts(days: number = 30): Observable<Batch[]> {
    return this.api.get<Batch[]>(`/batches/alerts/${days}`).pipe(
      map(response => response.data)
    );
  }

  create(batch: Partial<Batch>): Observable<Batch> {
    return this.api.post<Batch>('/batches', batch).pipe(
      map(response => response.data)
    );
  }

  update(batch: Partial<Batch>): Observable<Batch> {
    return this.api.put<Batch>('/batches', batch).pipe(
      map(response => response.data)
    );
  }
}
