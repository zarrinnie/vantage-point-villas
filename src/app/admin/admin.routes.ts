import { Routes } from '@angular/router';
import { adminAuthGuard } from './auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'login',
    title: 'Sign in — Site admin',
    loadComponent: () => import('./admin-login').then((m) => m.AdminLoginPage),
  },
  {
    path: '',
    canActivate: [adminAuthGuard],
    loadComponent: () => import('./admin-shell').then((m) => m.AdminShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'general' },
      {
        path: ':section',
        title: 'Site admin',
        loadComponent: () => import('./sections/section-page').then((m) => m.SectionPage),
      },
    ],
  },
];
