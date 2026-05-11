import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ApiResponse<T> {
  data: T;
  msg: string;
  status: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  private makeUrl(path: string) {
    return `${this.baseUrl}${path}`;
  }

  get<T>(path: string, options?: { headers?: Record<string, string> }): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(this.makeUrl(path), options);
  }

  post<T>(path: string, body: unknown, options?: { headers?: Record<string, string> }): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(this.makeUrl(path), body, options);
  }

  put<T>(path: string, body: unknown, options?: { headers?: Record<string, string> }): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(this.makeUrl(path), body, options);
  }

  delete<T>(path: string, options?: { headers?: Record<string, string> }): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(this.makeUrl(path), options);
  }
}
