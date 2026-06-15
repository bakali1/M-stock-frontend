import { Injectable, signal } from '@angular/core';
import { Batch } from '../models/batch.model';

@Injectable({
  providedIn: 'root'
})
export class QuarantineService {
  quarantineRequested = signal<Batch | null>(null);

  requestQuarantine(batch: Batch) {
    this.quarantineRequested.set(batch);
  }

  clearRequest() {
    this.quarantineRequested.set(null);
  }
}
