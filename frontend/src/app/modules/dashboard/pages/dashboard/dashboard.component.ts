import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // 👈 esto trae NgIf, NgFor, NgClass, etc.

interface DashboardMetric {
  key: 'parcelas' | 'inventario' | 'ordenes';
  title: string;
  value: number | string;
  subtitle: string;
  accent: 'primary' | 'warning' | 'info';
}

type TaskType = 'parcela' | 'inventario' | 'orden';
type TaskStatus = 'pendiente' | 'en_progreso' | 'completada';

interface TodayTask {
  title: string;
  type: TaskType;
  time: string;
  status: TaskStatus;
}

type AlertSeverity = 'alto' | 'medio' | 'bajo';
type AlertModule = 'parcelas' | 'inventario' | 'ordenes';

interface AlertItem {
  title: string;
  description: string;
  severity: AlertSeverity;
  module: AlertModule;
}

interface ActivityItem {
  title: string;
  time: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],   // 👈 con esto ya se quitan los warnings de *ngIf / *ngFor / [ngClass]
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  metrics: DashboardMetric[] = [
    {
      key: 'parcelas',
      title: 'Parcelas',
      value: 12,
      subtitle: 'Parcelas activas',
      accent: 'primary',
    },
    {
      key: 'inventario',
      title: 'Inventario',
      value: 150,
      subtitle: 'Productos en stock',
      accent: 'info',
    },
    {
      key: 'ordenes',
      title: 'Órdenes',
      value: 8,
      subtitle: 'Órdenes pendientes',
      accent: 'warning',
    },
  ];

  todayTasks: TodayTask[] = [
    {
      title: 'Riego programado - Parcela Norte',
      type: 'parcela',
      time: 'Hoy • 17:00',
      status: 'pendiente',
    },
    {
      title: 'Aplicación de fertilizante - Parcela Este',
      type: 'parcela',
      time: 'Hoy • 18:30',
      status: 'en_progreso',
    },
    {
      title: 'Revisión de stock de fertilizantes',
      type: 'inventario',
      time: 'Hoy • 20:00',
      status: 'pendiente',
    },
    {
      title: 'Cierre de órdenes del día',
      type: 'orden',
      time: 'Hoy • 21:30',
      status: 'pendiente',
    },
  ];

  alerts: AlertItem[] = [
    {
      title: 'Stock bajo de fertilizante NPK',
      description: 'Quedan menos de 5 unidades disponibles en inventario.',
      severity: 'alto',
      module: 'inventario',
    },
    {
      title: 'Riego atrasado en Parcela Oeste',
      description: 'La última aplicación de riego fue hace más de 5 días.',
      severity: 'medio',
      module: 'parcelas',
    },
    {
      title: 'Órdenes abiertas sin responsable',
      description: 'Hay 2 órdenes sin usuario asignado.',
      severity: 'bajo',
      module: 'ordenes',
    },
  ];

  recentActivity: ActivityItem[] = [
    {
      title: 'Se registró una nueva parcela: Parcela Sur',
      time: 'Hace 15 minutos',
    },
    {
      title: 'Se actualizó el stock de herbicida selectivo',
      time: 'Hace 40 minutos',
    },
    {
      title: 'Se completó la orden OR-00125',
      time: 'Hace 1 hora',
    },
    {
      title: 'Se creó la orden OR-00126',
      time: 'Hace 2 horas',
    },
  ];

  mapTaskType(type: TaskType): string {
    switch (type) {
      case 'parcela':
        return 'Parcela';
      case 'inventario':
        return 'Inventario';
      case 'orden':
        return 'Orden';
      default:
        return '';
    }
  }

  mapTaskStatus(status: TaskStatus): string {
    switch (status) {
      case 'pendiente':
        return 'Pendiente';
      case 'en_progreso':
        return 'En progreso';
      case 'completada':
        return 'Completada';
      default:
        return '';
    }
  }

  mapSeverity(severity: AlertSeverity): string {
    switch (severity) {
      case 'alto':
        return 'Alta prioridad';
      case 'medio':
        return 'Prioridad media';
      case 'bajo':
        return 'Prioridad baja';
      default:
        return '';
    }
  }

  mapModule(module: AlertModule): string {
    switch (module) {
      case 'parcelas':
        return 'Módulo de Parcelas';
      case 'inventario':
        return 'Módulo de Inventario';
      case 'ordenes':
        return 'Módulo de Órdenes';
      default:
        return '';
    }
  }
}
