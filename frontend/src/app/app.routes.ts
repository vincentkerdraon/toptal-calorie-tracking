import { Routes } from '@angular/router';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { LoginComponent } from './views/login/login.component';
import { ReportingComponent } from './views/reporting/reporting.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'admin/reporting', component: ReportingComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Default route
];
