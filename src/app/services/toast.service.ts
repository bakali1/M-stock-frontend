import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = signal<Toast[]>([]);
  toasts$ = this.toasts.asReadonly();

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    const id = Date.now().toString();
    const toast: Toast = { id, message, type };
    
    this.toasts.update(toasts => [...toasts, toast]);
    
    setTimeout(() => this.remove(id), 3000);
    
    return id;
  }

  remove(id: string) {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  success(message: string) {
    return this.show(message, 'success');
  }

  error(message: string) {
    return this.show(message, 'error');
  }

  info(message: string) {
    return this.show(message, 'info');
  }

  warning(message: string) {
    return this.show(message, 'warning');
  }
}
