import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/mapa/pages/mapa-page/mapa-page.component').then((m) => m.MapaPageComponent),
  },
  {
    path: 'ar',
    loadComponent: () =>
      import('./features/ar/pages/ar-page/ar-page.component').then((m) => m.ArPageComponent),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/pages/admin-page/admin-page.component').then((m) => m.AdminPageComponent),
  },
  { path: '**', redirectTo: '' },
];
