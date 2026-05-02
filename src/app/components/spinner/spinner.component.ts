import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <div class="flex items-center justify-center gap-3">
      <div [class]="spinnerClasses"></div>
      @if (label()) {
        <span class="text-gray-600">{{ label() }}</span>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpinnerComponent {
  size = input<'sm' | 'md' | 'lg'>('md');
  label = input<string | null>(null);

  get spinnerClasses(): string {
    const baseClass = 'border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin';
    
    const sizes: Record<'sm' | 'md' | 'lg', string> = {
      sm: 'w-4 h-4',
      md: 'w-8 h-8',
      lg: 'w-12 h-12'
    };
    
    return `${baseClass} ${sizes[this.size()]}`;
  }
}
