import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { BatchDetailPageComponent } from './features/batches/batch-detail-page.component';
import { BatchSearchComponent } from './features/batches/batch-search.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProductSearchComponent } from './features/product/product-search.component';
import { StockMovementComponent } from './features/transactions/stock-movement.component';
import { UserAccount } from './features/user/user-account/user-account';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'batches', component: BatchSearchComponent },
      { path: 'batches/:id', component: BatchDetailPageComponent },
      { path: 'stock-movement', component: StockMovementComponent },
      { path: 'product', component: ProductSearchComponent },
      { path: 'account', component: UserAccount}
    ]
  }
];
