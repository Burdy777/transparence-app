import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
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
    loadChildren: () => import('./features/user/user.routes').then((m) => m.userRoutes),
  },
  {
    path: 'historique',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/report-history/report-history').then((m) => m.ReportHistory),
  },
  { path: '', pathMatch: 'full', redirectTo: 'nouveau-rapport' },
  { path: '**', redirectTo: 'nouveau-rapport' },
];
