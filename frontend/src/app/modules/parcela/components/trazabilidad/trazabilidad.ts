import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParcelasService } from '../../services/parcela.service';  // ✅ CORREGIDO
import { TrazabilidadParcela, formatearCosto, formatearHectareas } from '../../../../models/parcela.model';  // ✅ CORREGIDO

@Component({
  selector: 'app-trazabilidad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trazabilidad.component.html',
  styleUrl: './trazabilidad.component.css'
})
export class TrazabilidadComponent implements OnInit {
  private parcelasService = inject(ParcelasService);
  
  @Input() parcelaId!: number;
  
  trazabilidad?: TrazabilidadParcela;
  loading = false;

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
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar trazabilidad:', error);
        this.loading = false;
      }
    });
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