import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';

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
  // RECETAS
  // =============================

  {
    path: 'receta',
    loadComponent: () =>
      import('./modules/receta/pages/receta-list/receta-list.component').then(
        (m) => m.RecetaListComponent
      ),
    canActivate: [AuthGuard]
  },

  {
    path: 'receta/nueva',
    loadComponent: () =>
      import('./modules/receta/pages/receta-create-edit/receta-create-edit.component').then(
        (m) => m.RecetaCreateEditComponent
      ),
    canActivate: [AuthGuard]
  },

  {
    path: 'receta/editar/:id',
    loadComponent: () =>
      import('./modules/receta/pages/receta-create-edit/receta-create-edit.component').then(
        (m) => m.RecetaCreateEditComponent
      ),
    canActivate: [AuthGuard]
  },

  {
    path: 'receta/:id',
    loadComponent: () =>
      import('./modules/receta/pages/receta-detail/receta-detail.component').then(
        (m) => m.RecetaDetailComponent
      ),
    canActivate: [AuthGuard]
  },

  // =============================
  // ÓRDENES DE APLICACIÓN
  // =============================

  {
    path: 'ordenes',
    loadComponent: () =>
      import('./modules/ordenes/pages/orden-list/orden-list.component').then(
        (m) => m.OrdenListComponent
      ),
    canActivate: [AuthGuard]
  },

  {
    path: 'ordenes/nueva',
    loadComponent: () =>
      import('./modules/ordenes/pages/orden-create/orden-create.component').then(
        (m) => m.OrdenCreateComponent
      ),
    canActivate: [AuthGuard]
  },

  {
    path: 'ordenes/:id',
    loadComponent: () =>
      import('./modules/ordenes/pages/orden-detail/orden-detail.component').then(
        (m) => m.OrdenDetailComponent
      ),
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