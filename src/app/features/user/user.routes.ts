import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth-guard';

export const userRoutes: Routes = [
  {
    path: 'profil',
    canActivate: [authGuard],
    loadComponent: () => import('./components/user-profile/user-profile').then((m) => m.UserProfile),
  },
];
