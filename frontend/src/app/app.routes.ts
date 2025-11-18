import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./modules/auth/login.component').then((m) => m.LoginComponent)
  },

  {
    path: 'dashboard',
    loadComponent: () =>
      import('./modules/dashboard/pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [AuthGuard]
  },

  {
    path: 'inventario',
    loadComponent: () =>
      import(
        './modules/inventario/pages/inventario/inventario.component'
      ).then((m) => m.InventarioComponent),
    canActivate: [AuthGuard]
  },

  // =============================
  // PARCELAS (CARPETA REAL = parcela)
  // =============================

  {
    path: 'parcelas',
    loadComponent: () =>
      import('./modules/parcela/pages/parcela/parcela.component').then(
        (m) => m.ParcelaComponent
      ),
    canActivate: [AuthGuard]
  },

  {
    path: 'parcelas/:id',
    loadComponent: () =>
      import(
        './modules/parcela/components/detalle-parcela/detalle-parcela'
      ).then((m) => m.DetalleParcelaComponent),
    canActivate: [AuthGuard]
  },

  // =============================
  // 404
  // =============================
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
