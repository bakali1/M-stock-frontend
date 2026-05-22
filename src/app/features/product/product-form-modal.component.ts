import { Component, ChangeDetectionStrategy, input, output, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ModalComponent } from '../../components/modal/modal.component';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  template: `
    <app-modal
      [title]="isEdit() ? 'Edit Product' : 'Add Product'"
      [showSubmit]="true"
      [submitLabel]="isEdit() ? 'Save' : 'Create'"
      (onClose)="onClose.emit()"
      (onSubmit)="submit()"
    >
      <form [formGroup]="form" class="space-y-4" (ngSubmit)="submit()">
        <div>
          <label for="product-name" class="block text-sm font-medium text-[var(--app-text-secondary)] mb-1">
            Name <span class="text-[var(--app-danger)]">*</span>
          </label>
          <input
            id="product-name"
            formControlName="name"
            type="text"
            class="w-full px-4 py-2 border border-[var(--app-border-strong)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--app-brand)] bg-[var(--app-surface)] text-[var(--app-text-primary)]"
            [attr.aria-invalid]="nameInvalid()"
            [attr.aria-describedby]="nameInvalid() ? 'name-error' : null"
          />
          @if (nameInvalid()) {
            <p id="name-error" class="mt-1 text-sm text-[var(--app-danger)]" role="alert">Name is required</p>
          }
        </div>

        <div>
          <label for="product-nsn" class="block text-sm font-medium text-[var(--app-text-secondary)] mb-1">
            NSN Code <span class="text-[var(--app-danger)]">*</span>
          </label>
          <input
            id="product-nsn"
            formControlName="nsnCode"
            type="text"
            class="w-full px-4 py-2 border border-[var(--app-border-strong)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--app-brand)] bg-[var(--app-surface)] text-[var(--app-text-primary)]"
            [attr.aria-invalid]="nsnInvalid()"
            [attr.aria-describedby]="nsnInvalid() ? 'nsn-error' : null"
          />
          @if (nsnInvalid()) {
            <p id="nsn-error" class="mt-1 text-sm text-[var(--app-danger)]" role="alert">NSN code is required</p>
          }
        </div>

        <div>
          <label for="product-description" class="block text-sm font-medium text-[var(--app-text-secondary)] mb-1">
            Description
          </label>
          <textarea
            id="product-description"
            formControlName="description"
            rows="3"
            class="w-full px-4 py-2 border border-[var(--app-border-strong)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--app-brand)] bg-[var(--app-surface)] text-[var(--app-text-primary)]"
          ></textarea>
        </div>

        <div>
          <label for="product-par-level" class="block text-sm font-medium text-[var(--app-text-secondary)] mb-1">
             Reorder ammount <span class="text-[var(--app-danger)]">*</span>
          </label>
          <input
            id="product-par-level"
            formControlName="minimumStockLevel"
            type="number"
            min="0"
            class="w-full px-4 py-2 border border-[var(--app-border-strong)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--app-brand)] bg-[var(--app-surface)] text-[var(--app-text-primary)]"
            [attr.aria-invalid]="minimumStockLevelInvalid()"
            [attr.aria-describedby]="minimumStockLevelInvalid() ? 'par-level-error' : null"
          />
          @if (minimumStockLevelInvalid()) {
            <p id="par-level-error" class="mt-1 text-sm text-[var(--app-danger)]" role="alert"> Reorder ammount must be 0 or greater</p>
          }
        </div>

        <div class="flex items-center gap-2">
          <input
            id="product-active"
            formControlName="active"
            type="checkbox"
            class="h-4 w-4 rounded border-[var(--app-border-strong)] text-[var(--app-brand)] focus:ring-[var(--app-brand)]"
          />
          <label for="product-active" class="text-sm text-[var(--app-text-secondary)]">Active</label>
        </div>
      </form>
    </app-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductFormModalComponent implements OnInit {
  product = input<Product | null>(null);

  onClose = output<void>();
  onSave = output<Partial<Product>>();

  private fb = inject(FormBuilder);
  submitting = signal(false);

  isEdit = computed(() => this.product() !== null);

  form = this.fb.group({
    id: [0],
    name: ['', Validators.required],
    nsnCode: ['', Validators.required],
    description: [''],
    minimumStockLevel: [0, Validators.min(0)],
    active: [true]
  });

  nameInvalid = computed(() => {
    const c = this.form.get('name');
    return c?.invalid && (c?.dirty || c?.touched);
  });

  nsnInvalid = computed(() => {
    const c = this.form.get('nsnCode');
    return c?.invalid && (c?.dirty || c?.touched);
  });

  minimumStockLevelInvalid = computed(() => {
    const c = this.form.get('minimumStockLevel');
    return c?.invalid && (c?.dirty || c?.touched);
  });

  ngOnInit() {
    const p = this.product();
    if (p) {
      this.form.patchValue({
        id: p.id,
        name: p.name,
        nsnCode: p.nsnCode,
        description: p.description,
        minimumStockLevel: p.minimumStockLevel,
        active: p.active
      });
    }
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const val = this.form.value;
    this.onSave.emit({
      id: val.id || undefined,
      name: val.name!,
      nsnCode: val.nsnCode!,
      description: val.description || '',
      minimumStockLevel: val.minimumStockLevel ?? 0,
      active: val.active ?? true
    });
  }
}
