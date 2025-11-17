import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold text-gray-900">🌾 AgriCol Dashboard</h1>
            <div class="flex items-center gap-4">
              <span class="text-gray-600">{{ user?.name }}</span>
              <button 
                (click)="logout()"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- Card 1 -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">📊 Parcelas</h3>
            <p class="text-3xl font-bold text-green-600">12</p>
            <p class="text-gray-600 text-sm mt-2">Total de parcelas activas</p>
          </div>

          <!-- Card 2 -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">📦 Inventario</h3>
            <p class="text-3xl font-bold text-blue-600">150</p>
            <p class="text-gray-600 text-sm mt-2">Productos en stock</p>
          </div>

          <!-- Card 3 -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">📋 Órdenes</h3>
            <p class="text-3xl font-bold text-orange-600">8</p>
            <p class="text-gray-600 text-sm mt-2">Órdenes pendientes</p>
          </div>

        </div>

        <!-- Bienvenida -->
        <div class="mt-8 bg-white rounded-lg shadow p-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">
            ¡Bienvenido, {{ user?.name }}! 👋
          </h2>
          <p class="text-gray-600">
            Has iniciado sesión correctamente en el sistema AgriCol.
          </p>
          <div class="mt-4 text-sm text-gray-500">
            <p><strong>Email:</strong> {{ user?.email }}</p>
            <p><strong>Rol:</strong> {{ user?.role }}</p>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  user: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener el usuario después de que el componente se inicialice
    this.user = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
  }
}