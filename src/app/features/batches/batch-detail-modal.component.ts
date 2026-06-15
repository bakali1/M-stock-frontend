import { Component, ChangeDetectionStrategy, input, output, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../components/modal/modal.component';
import { QuarantineService } from '../../services/quarantine.service';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { BatchService } from '../../services/batch.service';
import { ToastService } from '../../services/toast.service';
import { Batch } from '../../models/batch.model';
import { BatchDetailComponent } from './batch-detail/batch-detail.component';
import { ModalComponentBatch } from "./batch-detail/batch-modal/batch-modal.component";

@Component({
  selector: 'app-batch-detail-modal',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, BatchDetailComponent, ModalComponentBatch],
  template: `
    @if (showModal()) {
      <app-modal-batch
        [title]="'Batch Details'"
        [showSubmit]="false"
        [batchInput]="batch()"
        (onClose)="onClose.emit()"
      >
        @if (loading()) {
          <div class="flex justify-center py-8">
            <app-spinner label="Loading batch..."></app-spinner>
          </div>
        } @else if (batch()) {
          <app-batch-detail [batch]="batch()!" [showActions]="false"></app-batch-detail>
        }
      </app-modal-batch>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BatchDetailModalComponent implements OnInit {
  batchId = input.required<number>();
  showModal = input(true);

  private batchService = inject(BatchService);
  private toastService = inject(ToastService);
  private quarantineService = inject(QuarantineService);

  batch = signal<Batch | null>(null);
  loading = signal(false);

  onClose = output<void>();

  ngOnInit() {
    this.loadBatch();
  }

  private loadBatch() {
    this.loading.set(true);
    this.batchService.getById(this.batchId()).subscribe({
      next: (batch: Batch) => {
        this.batch.set(batch);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.toastService.error('Failed to load batch details');
        this.loading.set(false);
      }
    });
  }

  requestQuarantine() {
    const currentBatch = this.batch();
    if (currentBatch) {
      this.quarantineService.requestQuarantine(currentBatch);
    }
  }
}
