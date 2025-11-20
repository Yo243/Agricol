import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
  badgeColor?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  userName: string = 'Usuario';
  userRole: string = 'Administrador';
  isCollapsed: boolean = false;

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: '📊',
      route: '/dashboard'
    },
    {
      label: 'Inventario',
      icon: '📦',
      route: '/inventario',
      badge: '2',
      badgeColor: 'warning'
    },
    {
      label: 'Recetas',
      icon: '📋',
      route: '/receta'
    },
    {
      label: 'Órdenes',
      icon: '🎯',
      route: '/ordenes',
      badge: '3',
      badgeColor: 'info'
    },
    {
      label: 'Parcelas',
      icon: '🌾',
      route: '/parcelas'
    },
    {
      label: 'Trazabilidad',
      icon: '🔍',
      route: '/trazabilidad'
    },
    {
      label: 'Reportes',
      icon: '📈',
      route: '/reportes'
    },
    {
      label: 'Usuarios',
      icon: '👥',
      route: '/usuarios'
    },
    {
      label: 'Roles',
      icon: '🔐',
      route: '/roles'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Obtener datos del usuario del localStorage o servicio de autenticación
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.name) {
      this.userName = user.name;
      this.userRole = user.role === 'admin' ? 'Administrador' : 'Operador';
    }
  }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}