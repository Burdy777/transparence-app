import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: '',
    loadChildren: () => import('./features/home/home.routes').then((m) => m.homeRoutes),
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/report-intervention/report-intervention.routes').then(
        (m) => m.reportInterventionRoutes,
      ),
  },
  {
    path: '',
    loadChildren: () => import('./features/anomaly/anomaly.routes').then((m) => m.anomalyRoutes),
  },
  {
    path: 'historique',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/report-history/report-history').then((m) => m.ReportHistory),
  },
  { path: '', pathMatch: 'full', redirectTo: 'accueil' },
  { path: '**', redirectTo: 'accueil' },
];
