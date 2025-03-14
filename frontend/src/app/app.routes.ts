import { Routes } from '@angular/router';
import { AdminGuard, AuthGuard } from './auth-guard';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { LoginComponent } from './views/login/login.component';
import { ReportingComponent } from './views/reporting/reporting.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'admin/reporting',
    component: ReportingComponent,
    canActivate: [AdminGuard],
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Default route
];
