import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Ruta raíz - redirige al login
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  
  // Ruta de Login (sin protección)
  {
    path: 'login',
    loadComponent: () => import('./modules/auth/login.component').then(m => m.LoginComponent)
  },
  
  // Ruta de Dashboard (protegida)
  {
    path: 'dashboard',
    loadComponent: () => import('./modules/dashboard/pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  
  // Ruta de Inventario (protegida)
  {
    path: 'inventario',
    loadComponent: () => import('./modules/inventario/pages/inventario/inventario.component').then(m => m.InventarioComponent),
    canActivate: [AuthGuard]
  },
  
  // ==========================================
  // RUTAS DE PARCELAS (NUEVO MÓDULO)
  // ==========================================
  
  // Lista de Parcelas
  {
    path: 'parcelas',
    loadComponent: () => import('./modules/parcelas/pages/parcelas/parcelas.component').then(m => m.ParcelasComponent),
    canActivate: [AuthGuard]
  },
  
  // Detalle de Parcela (componente auxiliar)
  {
    path: 'parcelas/:id',
    loadComponent: () => import('./modules/parcelas/components/detalle-parcela/detalle-parcela.component').then(m => m.DetalleParcelaComponent),
    canActivate: [AuthGuard]
  },
  
  // ==========================================
  // RUTA 404 - Página no encontrada
  // ==========================================
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];