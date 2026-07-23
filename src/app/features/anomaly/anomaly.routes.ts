import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth-guard';

export const anomalyRoutes: Routes = [
  {
    path: 'anomalie',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/anomaly-form/anomaly-form').then((m) => m.AnomalyForm),
  },
];
