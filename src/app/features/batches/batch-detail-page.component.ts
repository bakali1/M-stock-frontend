import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BatchService } from '../../services/batch.service';
import { ToastService } from '../../services/toast.service';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { ButtonComponent } from '../../components/button/button.component';
import { Batch } from '../../models/batch.model';
import { BatchDetailComponent } from './batch-detail/batch-detail.component';

@Component({
  selector: 'app-batch-detail-page',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, ButtonComponent, BatchDetailComponent],
  template: `
    <div class="p-8">
      <div class="mb-8 flex items-center justify-between">
        <h1 class="text-3xl font-bold text-[var(--app-text-primary)]">Batch Details</h1>
        <app-button variant="ghost" (onClick)="goBack()">← Back</app-button>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-8">
          <app-spinner label="Loading batch..."></app-spinner>
        </div>
      } @else if (batch()) {
        <app-batch-detail [batch]="batch()!"></app-batch-detail>
      } @else {
        <div class="text-center py-8 text-[var(--app-text-muted)]">
          <p>Batch not found</p>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BatchDetailPageComponent implements OnInit {
  private batchService = inject(BatchService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  batch = signal<Batch | null>(null);
  loading = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBatch(Number(id));
    }
  }

  private loadBatch(id: number) {
    this.loading.set(true);
    this.batchService.getById(id).subscribe({
      next: (batch: Batch) => {
        this.batch.set(batch);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.toastService.error('Failed to load batch');
        this.loading.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/batches']);
  }
}
