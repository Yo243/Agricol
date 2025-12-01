import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  // LOGIN (Sin sidebar)
  {
    path: 'login',
    loadComponent: () =>
      import('./modules/auth/login.component').then((m) => m.LoginComponent)
  },

  // TODAS LAS RUTAS CON SIDEBAR
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./modules/dashboard/pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          )
      },
      {
        path: 'inventario',
        loadComponent: () =>
          import('./modules/inventario/pages/inventario/inventario.component').then(
            (m) => m.InventarioComponent
          )
      },
      {
        path: 'parcelas',
        loadComponent: () =>
          import('./modules/parcela/pages/parcela/parcela.component').then(
            (m) => m.ParcelaComponent
          )
      },
      {
        path: 'parcelas/:id',
        loadComponent: () =>
          import('./modules/parcela/components/detalle-parcela/detalle-parcela.component').then(
            (m) => m.DetalleParcelaComponent
          )
      },
      {
        path: 'receta',
        loadComponent: () =>
          import('./modules/receta/pages/receta-list/receta-list.component').then(
            (m) => m.RecetaListComponent
          )
      },
      {
        path: 'receta/nueva',
        loadComponent: () =>
          import('./modules/receta/pages/receta-create-edit/receta-create-edit.component').then(
            (m) => m.RecetaCreateEditComponent
          )
      },
      {
        path: 'receta/editar/:id',
        loadComponent: () =>
          import('./modules/receta/pages/receta-create-edit/receta-create-edit.component').then(
            (m) => m.RecetaCreateEditComponent
          )
      },
      {
        path: 'receta/:id',
        loadComponent: () =>
          import('./modules/receta/pages/receta-detail/receta-detail.component').then(
            (m) => m.RecetaDetailComponent
          )
      },
      {
        path: 'ordenes',
        loadComponent: () =>
          import('./modules/ordenes/pages/orden-list/orden-list.component').then(
            (m) => m.OrdenListComponent
          )
      },
      {
        path: 'ordenes/nueva',
        loadComponent: () =>
          import('./modules/ordenes/pages/orden-create/orden-create.component').then(
            (m) => m.OrdenCreateComponent
          )
      },
      {
        path: 'ordenes/:id',
        loadComponent: () =>
          import('./modules/ordenes/pages/orden-detail/orden-detail.component').then(
            (m) => m.OrdenDetailComponent
          )
      },

      // ==================== MÓDULO DE REPORTES ====================
      {
        path: 'reportes',
        loadComponent: () =>
          import('./modules/reportes/pages/reportes-dashboard/reportes-dashboard.component').then(
            (m) => m.ReportesDashboardComponent
          )
      },
      {
        path: 'periodos-siembra',
        loadComponent: () =>
          import('./modules/reportes/pages/periodo-siembra-list/periodo-siembra-list.component').then(
            (m) => m.PeriodoSiembraListComponent
          )
      },
      {
        path: 'periodos-siembra/nuevo',
        loadComponent: () =>
          import('./modules/reportes/pages/periodo-siembra-create/periodo-siembra-create.component').then(
            (m) => m.PeriodoSiembraCreateComponent
          )
      },
      // =========================================================

      // ==================== MÓDULO DE USUARIOS ====================
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./modules/usuarios/pages/usuarios-list.component').then(
            (m) => m.UsuariosListComponent
          )
      },
      {
        path: 'usuarios/nuevo',
        loadComponent: () =>
          import('./modules/usuarios/components/crear-usuario/crear-usuario.component').then(
            (m) => m.CrearUsuarioComponent
          )
      },
      {
        path: 'usuarios/editar/:id',
        loadComponent: () =>
          import('./modules/usuarios/components/editar-usuario/editar-usuario.component').then(
            (m) => m.EditarUsuarioComponent
          )
      }
      // =========================================================
    ]
  },

  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
