import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth-guard';

export const homeRoutes: Routes = [
  {
    path: 'accueil',
    canActivate: [authGuard],
    loadComponent: () => import('./home').then((m) => m.Home),
  },
];
