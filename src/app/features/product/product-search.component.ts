import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';
import { CardComponent } from '../../components/card/card.component';
import { ButtonComponent } from '../../components/button/button.component';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { ProductFormModalComponent } from './product-form-modal.component';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    ButtonComponent,
    SpinnerComponent,
    ProductFormModalComponent
  ],
  template: `
    <div class="p-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Products</h1>
        <app-button (onClick)="openCreate()">Add Product</app-button>
      </div>

      <app-card>
        <div class="p-6 border-b border-gray-200">
          <div class="flex gap-3">
            <input
              [formControl]="searchControl"
              type="text"
              placeholder="Search by name or NSN..."
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search products"
            />
            <app-button (onClick)="search()" [loading]="searching()">Search</app-button>
          </div>
        </div>

        <div class="p-6">
          @if (loading()) {
            <div class="flex justify-center py-8">
              <app-spinner label="Loading products..."></app-spinner>
            </div>
          } @else if (products().length === 0 && searched()) {
            <div class="text-center py-8 text-gray-500">
              <p>No products found</p>
            </div>
          } @else if (products().length > 0) {
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">NSN Code</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Par Level</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (product of products(); track product.id) {
                    <tr class="border-b border-gray-200 hover:bg-gray-50">
                      <td class="px-6 py-3 text-sm text-gray-700">{{ product.name }}</td>
                      <td class="px-6 py-3 text-sm text-gray-700">{{ product.nsnCode }}</td>
                      <td class="px-6 py-3 text-sm text-gray-700">{{ product.description || '—' }}</td>
                      <td class="px-6 py-3 text-sm text-gray-700">{{ product.parLevel }}</td>
                      <td class="px-6 py-3 text-sm">
                        <span [class]="getActiveBadge(product.active)">
                          {{ product.active ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                      <td class="px-6 py-3 text-sm">
                        <div class="flex gap-2">
                          <button
                            (click)="openEdit(product)"
                            class="text-blue-600 hover:text-blue-800 font-medium"
                            [attr.aria-label]="'Edit ' + product.name"
                          >
                            Edit
                          </button>
                          <button
                            (click)="confirmDelete(product)"
                            class="text-red-600 hover:text-red-800 font-medium"
                            [attr.aria-label]="'Delete ' + product.name"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </app-card>
    </div>

    @if (showFormModal()) {
      <app-product-form-modal
        [product]="editingProduct()"
        (onClose)="closeFormModal()"
        (onSave)="handleSave($event)"
      ></app-product-form-modal>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductSearchComponent implements OnInit {
  private productService = inject(ProductService);
  private toastService = inject(ToastService);

  searchControl = new FormControl('');
  products = signal<Product[]>([]);
  loading = signal(false);
  searching = signal(false);
  searched = signal(false);

  showFormModal = signal(false);
  editingProduct = signal<Product | null>(null);

  ngOnInit() {
    this.loadAll();
    this.setupSearch();
  }

  private loadAll() {
    this.loading.set(true);
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products.set(data || []);
        this.loading.set(false);
        this.searched.set(true);
      },
      error: () => {
        this.toastService.error('Failed to load products');
        this.loading.set(false);
        this.searched.set(true);
      }
    });
  }

  private setupSearch() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        if (this.searchControl.value) {
          this.search();
        }
      });
  }

  search() {
    const query = this.searchControl.value?.trim();
    if (!query) {
      this.loadAll();
      return;
    }

    this.searching.set(true);
    this.loading.set(true);

    this.productService.getAll().subscribe({
      next: (data) => {
        const filtered = (data || []).filter(
          p => p.name.toLowerCase().includes(query.toLowerCase()) ||
               p.nsnCode.toLowerCase().includes(query.toLowerCase())
        );
        this.products.set(filtered);
        this.searching.set(false);
        this.loading.set(false);
        this.searched.set(true);
      },
      error: () => {
        this.toastService.error('Search failed');
        this.searching.set(false);
        this.loading.set(false);
        this.searched.set(true);
      }
    });
  }

  openCreate() {
    this.editingProduct.set(null);
    this.showFormModal.set(true);
  }

  openEdit(product: Product) {
    this.editingProduct.set(product);
    this.showFormModal.set(true);
  }

  closeFormModal() {
    this.showFormModal.set(false);
    this.editingProduct.set(null);
  }

  handleSave(product: Partial<Product>) {
    if (product.id) {
      this.productService.update(product).subscribe({
        next: () => {
          this.toastService.success('Product updated');
          this.closeFormModal();
          this.loadAll();
        },
        error: () => this.toastService.error('Update failed')
      });
    } else {
      this.productService.create(product).subscribe({
        next: () => {
          this.toastService.success('Product created');
          this.closeFormModal();
          this.loadAll();
        },
        error: () => this.toastService.error('Create failed')
      });
    }
  }

  confirmDelete(product: Product) {
    if (!confirm(`Delete "${product.name}"?`)) return;

    this.productService.delete(product.id).subscribe({
      next: () => {
        this.toastService.success('Product deleted');
        this.loadAll();
      },
      error: () => this.toastService.error('Delete failed')
    });
  }

  getActiveBadge(active: boolean): string {
    return active
      ? 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold'
      : 'bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-semibold';
  }
}
