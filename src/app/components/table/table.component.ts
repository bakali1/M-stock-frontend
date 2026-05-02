import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-table',
  standalone: true,
  template: `
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <ng-content></ng-content>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent {}
