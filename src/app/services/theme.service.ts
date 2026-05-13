import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'theme-mode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private document = inject(DOCUMENT);
  private mode = signal<ThemeMode>('light');

  readonly isDark = computed(() => this.mode() === 'dark');

  constructor() {
    this.mode.set(this.getInitialMode());
    effect(() => {
      this.applyMode(this.mode());
    });
  }

  toggle(): void {
    this.setMode(this.isDark() ? 'light' : 'dark');
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
    this.persist(mode);
  }

  getMode(): ThemeMode {
    return this.mode();
  }

  private getInitialMode(): ThemeMode {
    const stored = this.readStoredMode();
    if (stored) {
      return stored;
    }
    return this.prefersDark() ? 'dark' : 'light';
  }

  private prefersDark(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private readStoredMode(): ThemeMode | null {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      if (value === 'light' || value === 'dark') {
        return value;
      }
    } catch {
      return null;
    }
    return null;
  }

  private persist(mode: ThemeMode): void {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      return;
    }
  }

  private applyMode(mode: ThemeMode): void {
    const body = this.document.body;
    if (!body) {
      return;
    }
    body.classList.remove('theme-light', 'theme-dark');
    body.classList.add(`theme-${mode}`);
  }
}
