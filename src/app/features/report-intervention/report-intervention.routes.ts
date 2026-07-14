import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth-guard';

export const reportInterventionRoutes: Routes = [
  {
    path: 'nouveau-rapport',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/report-form/report-form').then((m) => m.ReportForm),
  },
];
