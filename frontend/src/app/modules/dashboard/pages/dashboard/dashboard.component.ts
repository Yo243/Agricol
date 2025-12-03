import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { forkJoin } from 'rxjs';

// Interfaces
interface DashboardData {
  totalParcelas: number;
  parcelasActivas: number;
  totalHectareas: number;
  totalProductos: number;
  valorInventario: number;
  ordenesPendientes: number;
  totalOrdenes: number;
  periodosActivos: number;
  hectareasSembradas: number;
}

interface Actividad {
  id: number;
  nombre: string;
  tipo: string;
  fechaProgramada: string;
  estado: string;
  responsable?: string;
}

interface AlertaInventario {
  id: number;
  itemNombre: string;
  tipo: string;
  mensaje: string;
  prioridad: string;
  fecha: string;
  leida: boolean;
}

interface PeriodoSiembra {
  id: number;
  codigo: string;
  fechaInicio: string;
  fechaCosechaEsperada: string;
  hectareasSembradas: number;
  rendimientoEsperado?: number;
  estado: string;
  parcela: {
    nombre: string;
    codigo: string;
  };
  cultivo: {
    nombre: string;
    variedad?: string;
  };
}

interface InventarioItem {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number;
  unidadMedida: string;
  valorTotal: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  loading = true;
  error: string | null = null;

  // Datos del dashboard
  dashboardData: DashboardData = {
    totalParcelas: 0,
    parcelasActivas: 0,
    totalHectareas: 0,
    totalProductos: 0,
    valorInventario: 0,
    ordenesPendientes: 0,
    totalOrdenes: 0,
    periodosActivos: 0,
    hectareasSembradas: 0,
  };

  actividadesPendientes: Actividad[] = [];
  alertasInventario: AlertaInventario[] = [];
  periodosActivos: PeriodoSiembra[] = [];
  productosBajoStock: InventarioItem[] = [];

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    // Hacer todas las peticiones en paralelo
    forkJoin({
      parcelas: this.http.get<any>(`${this.apiUrl}/parcelas`),
      inventario: this.http.get<any>(`${this.apiUrl}/inventario`),
      ordenes: this.http.get<any>(`${this.apiUrl}/ordenes-aplicacion`),
      periodos: this.http.get<any>(`${this.apiUrl}/periodos-siembra`),
      actividades: this.http.get<any>(`${this.apiUrl}/periodos-siembra/actividades`),
      alertas: this.http.get<any>(`${this.apiUrl}/inventario/alertas`),
    }).subscribe({
      next: (responses) => {
        this.processDashboardData(responses);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando dashboard:', err);
        this.error = 'Error al cargar los datos del dashboard. Intenta de nuevo.';
        this.loading = false;
      },
    });
  }

  private processDashboardData(responses: any): void {
    // Procesar Parcelas
    const parcelas = this.extractData(responses.parcelas);
    this.dashboardData.totalParcelas = parcelas.length;
    this.dashboardData.parcelasActivas = parcelas.filter((p: any) => p.activo && p.estado === 'Activa').length;
    this.dashboardData.totalHectareas = parcelas.reduce((sum: number, p: any) => sum + (p.superficieHa || 0), 0);

    // Procesar Inventario
    const inventario = this.extractData(responses.inventario);
    this.dashboardData.totalProductos = inventario.filter((i: any) => i.activo).length;
    this.dashboardData.valorInventario = inventario.reduce((sum: number, i: any) => sum + (i.valorTotal || 0), 0);

    // Productos bajo stock (stock actual <= stock mínimo)
    this.productosBajoStock = inventario
      .filter((i: any) => i.activo && i.stockActual <= i.stockMinimo)
      .slice(0, 5);

    // Procesar Órdenes
    const ordenes = this.extractData(responses.ordenes);
    this.dashboardData.totalOrdenes = ordenes.length;
    this.dashboardData.ordenesPendientes = ordenes.filter((o: any) => o.estado === 'PENDIENTE').length;

    // Procesar Períodos de Siembra
    const periodos = this.extractData(responses.periodos);
    this.periodosActivos = periodos
      .filter((p: any) => p.estado === 'En Curso')
      .slice(0, 5);
    this.dashboardData.periodosActivos = this.periodosActivos.length;
    this.dashboardData.hectareasSembradas = periodos
      .filter((p: any) => p.estado === 'En Curso')
      .reduce((sum: number, p: any) => sum + (p.hectareasSembradas || 0), 0);

    // Procesar Actividades
    const actividades = this.extractData(responses.actividades);
    this.actividadesPendientes = actividades
      .filter((a: any) => a.estado === 'Pendiente')
      .sort((a: any, b: any) => new Date(a.fechaProgramada).getTime() - new Date(b.fechaProgramada).getTime())
      .slice(0, 6);

    // Procesar Alertas
    const alertas = this.extractData(responses.alertas);
    this.alertasInventario = alertas
      .filter((a: any) => !a.leida)
      .sort((a: any, b: any) => {
        const prioridadOrder: any = { alta: 1, media: 2, baja: 3 };
        return prioridadOrder[a.prioridad] - prioridadOrder[b.prioridad];
      })
      .slice(0, 5);
  }

  // Helper para extraer data de respuestas que pueden venir en diferentes formatos
  private extractData(response: any): any[] {
    if (Array.isArray(response)) {
      return response;
    }
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    if (response?.items && Array.isArray(response.items)) {
      return response.items;
    }
    return [];
  }

  // Formatear fechas
  formatFecha(fecha: string | Date): string {
    if (!fecha) return '-';
    
    const date = new Date(fecha);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Si es hoy
    if (diffDays === 0) {
      return `Hoy • ${date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Si es mañana
    if (diffDays === 1) {
      return `Mañana • ${date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Si es en los próximos 7 días
    if (diffDays > 0 && diffDays <= 7) {
      return `En ${diffDays} días`;
    }

    // Si ya pasó
    if (diffDays < 0) {
      return `Hace ${Math.abs(diffDays)} días`;
    }

    // Formato normal
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  // Obtener clase CSS para tipo de actividad
  getTipoClass(tipo: string): string {
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes('riego')) return 'riego';
    if (tipoLower.includes('fertiliz')) return 'fertilizacion';
    if (tipoLower.includes('control') || tipoLower.includes('plagas')) return 'control';
    if (tipoLower.includes('cosecha')) return 'cosecha';
    if (tipoLower.includes('siembra')) return 'siembra';
    return 'otro';
  }

  // Calcular porcentaje de stock
  getStockPercentage(item: InventarioItem): number {
    if (!item.stockMaximo) return 0;
    return (item.stockActual / item.stockMaximo) * 100;
  }

  // Obtener clase CSS según nivel de stock
  getStockClass(item: InventarioItem): string {
    const percentage = this.getStockPercentage(item);
    if (percentage <= 25) return 'stock-critical';
    if (percentage <= 50) return 'stock-low';
    if (percentage <= 75) return 'stock-medium';
    return 'stock-good';
  }
}