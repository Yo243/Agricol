import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParcelasService } from '../../services/parcela.service';
import {
  TrazabilidadParcela,
  formatearCosto,
  formatearHectareas
} from '../../../../models/parcela.model';

@Component({
  selector: 'app-trazabilidad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trazabilidad.html',
  styleUrls: ['./trazabilidad.css']
})
export class TrazabilidadComponent implements OnInit {
  private parcelasService = inject(ParcelasService);

  @Input() parcelaId!: number;

  trazabilidad?: TrazabilidadParcela;
  loading = false;

  // RESUMEN | Angular 16+ NO permite reduce() en templates
  totalPeriodos = 0;
  totalEventos = 0;
  totalCosto = 0;
  totalProduccion = 0;

  ngOnInit() {
    if (this.parcelaId) {
      this.cargarTrazabilidad();
    }
  }

  cargarTrazabilidad() {
    this.loading = true;

    this.parcelasService.getTrazabilidad(this.parcelaId).subscribe({
      next: (data: TrazabilidadParcela) => {
        this.trazabilidad = data;
        this.calcularResumen();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar trazabilidad:', error);
        this.loading = false;
      }
    });
  }

  private calcularResumen() {
    if (!this.trazabilidad) return;

    this.totalPeriodos = this.trazabilidad.trazabilidad.length;

    this.totalEventos = this.trazabilidad.trazabilidad.reduce(
      (sum, item) => sum + item.eventos.length,
      0
    );

    this.totalCosto = this.trazabilidad.trazabilidad.reduce(
      (sum, item) => sum + (item.periodo.costoTotal || 0),
      0
    );

    this.totalProduccion = this.trazabilidad.trazabilidad.reduce(
      (sum, item) => sum + (item.periodo.rendimiento || 0),
      0
    );
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatearCosto(costo: number): string {
    return formatearCosto(costo);
  }

  formatearHectareas(hectareas: number): string {
    return formatearHectareas(hectareas);
  }

  getEventIcon(tipo: string, tipoAplicacion?: string): string {
    if (tipo === 'Aplicación') {
      switch (tipoAplicacion) {
        case 'Fertilización': return '🌱';
        case 'Fumigación': return '💨';
        case 'Control de Plagas': return '🦟';
        case 'Control de Malezas': return '🌿';
        case 'Riego': return '💧';
        default: return '📋';
      }
    }
    return '📅';
  }
}
