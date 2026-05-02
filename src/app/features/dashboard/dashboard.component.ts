import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ExpirationAlertsComponent } from './expiration-alerts/expiration-alerts.component';
import { RecentActivityComponent } from './recent-activity/recent-activity.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ExpirationAlertsComponent, RecentActivityComponent],
  template: `
    <div class="p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <app-expiration-alerts></app-expiration-alerts>
        <app-recent-activity></app-recent-activity>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {}
