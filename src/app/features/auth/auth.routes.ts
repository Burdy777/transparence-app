import { Routes } from '@angular/router';
import { guestGuard } from '../../core/guards/guest-guard';

export const authRoutes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./components/login/login').then((m) => m.Login),
  },
];
