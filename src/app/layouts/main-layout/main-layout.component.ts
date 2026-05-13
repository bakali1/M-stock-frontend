import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ToastContainerComponent } from '../../components/toast/toast-container.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, ToastContainerComponent],
  template: `
  <div class="flex flex-col bg-[var(--app-surface-alt)]">
    <app-header></app-header> 
    <div class="flex flex-1">
      <app-sidebar></app-sidebar>
      <main class="flex-1 ml-64 mt-16 overflow-y-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
    <app-toast-container></app-toast-container>
  </div>
`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent {}
