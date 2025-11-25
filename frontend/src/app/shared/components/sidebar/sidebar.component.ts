import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
  badgeColor?: string;
  requiresAdmin?: boolean;
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
  isAdmin: boolean = true;
  isCollapsed: boolean = false;
  isMobileMenuOpen: boolean = false;

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: '📊',
      route: '/dashboard',
      requiresAdmin: false
    },
    {
      label: 'Inventario',
      icon: '📦',
      route: '/inventario',
      badge: '2',
      badgeColor: 'warning',
      requiresAdmin: false
    },
    {
      label: 'Recetas',
      icon: '📋',
      route: '/receta',
      requiresAdmin: false
    },
    {
      label: 'Órdenes',
      icon: '🎯',
      route: '/ordenes',
      badge: '3',
      badgeColor: 'info',
      requiresAdmin: false
    },
    {
      label: 'Parcelas',
      icon: '🌾',
      route: '/parcelas',
      requiresAdmin: false
    },
    {
      label: 'Reportes',
      icon: '📈',
      route: '/reportes',
      requiresAdmin: false
    },
    {
      label: 'Usuarios',
      icon: '👥',
      route: '/usuarios',
      requiresAdmin: true
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Obtener datos del usuario del localStorage o servicio de autenticación
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.name) {
      this.userName = user.name;
      this.userRole = user.role === 'admin' ? 'Administrador' : 'Operador';
      this.isAdmin = user.role === 'admin';
    }
  }

  get filteredMenuItems(): MenuItem[] {
    return this.menuItems.filter(item => {
      if (item.requiresAdmin && !this.isAdmin) {
        return false;
      }
      return true;
    });
  }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}