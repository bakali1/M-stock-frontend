import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { BatchSearchComponent } from './features/batches/batch-search.component';
import { BatchDetailPageComponent } from './features/batches/batch-detail-page.component';
import { StockMovementComponent } from './features/transactions/stock-movement.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'batches', component: BatchSearchComponent },
      { path: 'batches/:id', component: BatchDetailPageComponent },
      { path: 'stock-movement', component: StockMovementComponent }
    ]
  }
];
