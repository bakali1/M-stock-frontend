import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ExpirationAlertsComponent } from './expiration-alerts/expiration-alerts.component';
import { RecentActivityComponent } from './recent-activity/recent-activity.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ExpirationAlertsComponent, RecentActivityComponent],
  template: `
    <div class="p-8 h-[calc(100vh-4rem)]">
      <h1 class="text-3xl font-bold text-[var(--app-text-primary)] mb-8">Dashboard</h1>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <app-recent-activity></app-recent-activity>
        <app-expiration-alerts></app-expiration-alerts>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {}
