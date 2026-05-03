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
          <label for="product-name" class="block text-sm font-medium text-gray-700 mb-1">
            Name <span class="text-red-500">*</span>
          </label>
          <input
            id="product-name"
            formControlName="name"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            [attr.aria-invalid]="nameInvalid()"
            [attr.aria-describedby]="nameInvalid() ? 'name-error' : null"
          />
          @if (nameInvalid()) {
            <p id="name-error" class="mt-1 text-sm text-red-600" role="alert">Name is required</p>
          }
        </div>

        <div>
          <label for="product-nsn" class="block text-sm font-medium text-gray-700 mb-1">
            NSN Code <span class="text-red-500">*</span>
          </label>
          <input
            id="product-nsn"
            formControlName="nsnCode"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            [attr.aria-invalid]="nsnInvalid()"
            [attr.aria-describedby]="nsnInvalid() ? 'nsn-error' : null"
          />
          @if (nsnInvalid()) {
            <p id="nsn-error" class="mt-1 text-sm text-red-600" role="alert">NSN code is required</p>
          }
        </div>

        <div>
          <label for="product-description" class="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="product-description"
            formControlName="description"
            rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <div>
          <label for="product-par-level" class="block text-sm font-medium text-gray-700 mb-1">
            Par Level <span class="text-red-500">*</span>
          </label>
          <input
            id="product-par-level"
            formControlName="parLevel"
            type="number"
            min="0"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            [attr.aria-invalid]="parLevelInvalid()"
            [attr.aria-describedby]="parLevelInvalid() ? 'par-level-error' : null"
          />
          @if (parLevelInvalid()) {
            <p id="par-level-error" class="mt-1 text-sm text-red-600" role="alert">Par level must be 0 or greater</p>
          }
        </div>

        <div class="flex items-center gap-2">
          <input
            id="product-active"
            formControlName="active"
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label for="product-active" class="text-sm text-gray-700">Active</label>
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
    parLevel: [0, Validators.min(0)],
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

  parLevelInvalid = computed(() => {
    const c = this.form.get('parLevel');
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
        parLevel: p.parLevel,
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
      parLevel: val.parLevel ?? 0,
      active: val.active ?? true
    });
  }
}
