import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventarioService } from '../../services/inventario.service';
import { AlertaInventario, TipoAlerta } from '../../../../models/inventario.model';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.css']
})
export class AlertsComponent implements OnInit {
  @Input() alertas: AlertaInventario[] = [];
  @Output() closed = new EventEmitter<void>();

  alertasFiltradas: AlertaInventario[] = [];
  filtroActual: 'todas' | TipoAlerta = 'todas';
  loading = false;

  // Enums para usar en el template
  TipoAlerta = TipoAlerta;

  // Estadísticas
  estadisticas = {
    total: 0,
    stockBajo: 0,
    stockCritico: 0,
    proximoVencer: 0,
    vencido: 0,
    agotado: 0
  };

  constructor(private inventarioService: InventarioService) {}

  ngOnInit(): void {
    this.calcularEstadisticas();
    this.aplicarFiltro();
  }

  // Getter para alertas no leídas
  get alertasNoLeidas(): number {
    return this.alertasFiltradas.filter(a => !a.leida).length;
  }

  calcularEstadisticas(): void {
    this.estadisticas.total = this.alertas.length;
    this.estadisticas.stockBajo = this.alertas.filter(a => a.tipoAlerta === TipoAlerta.STOCK_BAJO).length;
    this.estadisticas.stockCritico = this.alertas.filter(a => a.tipoAlerta === TipoAlerta.STOCK_CRITICO).length;
    this.estadisticas.proximoVencer = this.alertas.filter(a => a.tipoAlerta === TipoAlerta.PROXIMO_VENCER).length;
    this.estadisticas.vencido = this.alertas.filter(a => a.tipoAlerta === TipoAlerta.VENCIDO).length;
    this.estadisticas.agotado = this.alertas.filter(a => a.tipoAlerta === TipoAlerta.STOCK_AGOTADO).length;
  }

  aplicarFiltro(): void {
    if (this.filtroActual === 'todas') {
      this.alertasFiltradas = [...this.alertas];
    } else {
      this.alertasFiltradas = this.alertas.filter(a => a.tipoAlerta === this.filtroActual);
    }
  }

  cambiarFiltro(filtro: 'todas' | TipoAlerta): void {
    this.filtroActual = filtro;
    this.aplicarFiltro();
  }

  marcarComoLeida(alerta: AlertaInventario): void {
    this.loading = true;
    this.inventarioService.marcarAlertaLeida(alerta.id).subscribe({
      next: () => {
        alerta.leida = true;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al marcar alerta:', error);
        this.loading = false;
      }
    });
  }

  marcarTodasLeidas(): void {
    const noLeidas = this.alertasFiltradas.filter(a => !a.leida);
    
    if (noLeidas.length === 0) {
      return;
    }

    this.loading = true;
    const promesas = noLeidas.map(a => 
      this.inventarioService.marcarAlertaLeida(a.id).toPromise()
    );

    Promise.all(promesas).then(() => {
      this.alertasFiltradas.forEach(a => a.leida = true);
      this.loading = false;
    }).catch(error => {
      console.error('Error al marcar alertas:', error);
      this.loading = false;
    });
  }

  getIconoAlerta(tipo: TipoAlerta): string {
    const iconos: Record<TipoAlerta, string> = {
      [TipoAlerta.STOCK_BAJO]: '⚠️',
      [TipoAlerta.STOCK_CRITICO]: '🚨',
      [TipoAlerta.PROXIMO_VENCER]: '⏰',
      [TipoAlerta.VENCIDO]: '❌',
      [TipoAlerta.STOCK_AGOTADO]: '📭'
    };
    return iconos[tipo];
  }

  getColorAlerta(tipo: TipoAlerta): string {
    const colores: Record<TipoAlerta, string> = {
      [TipoAlerta.STOCK_BAJO]: 'bg-yellow-50 border-yellow-200',
      [TipoAlerta.STOCK_CRITICO]: 'bg-orange-50 border-orange-200',
      [TipoAlerta.PROXIMO_VENCER]: 'bg-blue-50 border-blue-200',
      [TipoAlerta.VENCIDO]: 'bg-red-50 border-red-200',
      [TipoAlerta.STOCK_AGOTADO]: 'bg-gray-50 border-gray-200'
    };
    return colores[tipo];
  }

  getColorTexto(tipo: TipoAlerta): string {
    const colores: Record<TipoAlerta, string> = {
      [TipoAlerta.STOCK_BAJO]: 'text-yellow-800',
      [TipoAlerta.STOCK_CRITICO]: 'text-orange-800',
      [TipoAlerta.PROXIMO_VENCER]: 'text-blue-800',
      [TipoAlerta.VENCIDO]: 'text-red-800',
      [TipoAlerta.STOCK_AGOTADO]: 'text-gray-800'
    };
    return colores[tipo];
  }

  getPrioridadClass(prioridad: string): string {
    const clases: Record<string, string> = {
      'alta': 'bg-red-100 text-red-800',
      'media': 'bg-orange-100 text-orange-800',
      'baja': 'bg-blue-100 text-blue-800'
    };
    return clases[prioridad] || 'bg-gray-100 text-gray-800';
  }

  close(): void {
    this.closed.emit();
  }
}