import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private api = inject(ApiService);

  getAll(): Observable<Product[]> {
    return this.api.get<Product[]>('/products').pipe(
      map(response => response.data)
    );
  }

  search(key: string): Observable<Product[]> {
    return this.api.get<Product[]>(`/products/search?key=${encodeURIComponent(key)}`).pipe(
      map(response => response.data)
    );
  }

  getById(id: number): Observable<Product> {
    return this.api.get<Product>(`/products/${id}`).pipe(
      map(response => response.data)
    );
  }

  create(product: Partial<Product>): Observable<Product> {
    return this.api.post<Product>('/products', product).pipe(
      map(response => response.data)
    );
  }

  update(product: Partial<Product>): Observable<Product> {
    return this.api.put<Product>('/products', product).pipe(
      map(response => response.data)
    );
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/products/${id}`).pipe(
      map(response => response.data)
    );
  }
}
