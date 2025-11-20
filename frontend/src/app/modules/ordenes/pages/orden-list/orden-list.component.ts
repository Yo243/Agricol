// src/app/modules/orden-aplicacion/pages/orden-list/orden-list.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OrdenAplicacionService } from '../../services/orden-aplicacion.service';
import { 
  OrdenAplicacion, 
  OrdenFilters,
  Parcela 
} from '../../../../models/orden-aplicacion.model';

@Component({
  selector: 'app-orden-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './orden-list.component.html',
  styleUrls: ['./orden-list.component.css']
})
export class OrdenListComponent implements OnInit {
  
  private ordenService = inject(OrdenAplicacionService);
  private router = inject(Router);

  ordenes: OrdenAplicacion[] = [];
  parcelas: Parcela[] = [];
  
  filters: OrdenFilters = {};
  
  searchTerm: string = '';
  loading: boolean = false;
  error: string = '';

  // Estadísticas rápidas
  totalOrdenes: number = 0;
  ordenesPendientes: number = 0;
  ordenesAplicadas: number = 0;

  ngOnInit(): void {
    this.loadParcelas();
    this.loadOrdenes();
  }

  loadOrdenes(): void {
    this.loading = true;
    this.error = '';
    
    this.ordenService.getOrdenes(this.filters).subscribe({
      next: (data: OrdenAplicacion[]) => {
        this.ordenes = data;
        this.calcularEstadisticas();
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Error al cargar órdenes';
        console.error('Error:', err);
        this.loading = false;
      }
    });
  }

  loadParcelas(): void {
    this.ordenService.getParcelas().subscribe({
      next: (data: Parcela[]) => {
        this.parcelas = data;
      },
      error: (err: any) => {
        console.error('Error al cargar parcelas:', err);
      }
    });
  }

  calcularEstadisticas(): void {
    this.totalOrdenes = this.ordenes.length;
    this.ordenesPendientes = this.ordenes.filter(o => o.estado === 'pendiente').length;
    this.ordenesAplicadas = this.ordenes.filter(o => o.estado === 'aplicada').length;
  }

  onSearch(): void {
    this.filters.search = this.searchTerm;
    this.loadOrdenes();
  }

  onFilterChange(): void {
    this.loadOrdenes();
  }

  clearFilters(): void {
    this.filters = {};
    this.searchTerm = '';
    this.loadOrdenes();
  }

  viewOrden(id: number): void {
    this.router.navigate(['/ordenes', id]);
  }

  createOrden(): void {
    this.router.navigate(['/ordenes/nueva']);
  }

  cerrarOrden(orden: OrdenAplicacion): void {
    if (!orden.id) return;
    
    const confirmacion = confirm(
      `¿Cerrar la orden para "${orden.parcela?.nombre}"?\n\nEsto descontará los insumos del inventario.`
    );
    
    if (confirmacion) {
      this.ordenService.cerrarOrden(orden.id).subscribe({
        next: () => {
          alert('Orden cerrada exitosamente. Inventario actualizado.');
          this.loadOrdenes();
        },
        error: (err: any) => {
          console.error('Error al cerrar orden:', err);
          alert('Error al cerrar la orden: ' + (err.error?.message || 'Error desconocido'));
        }
      });
    }
  }

  cancelarOrden(orden: OrdenAplicacion): void {
    if (!orden.id) return;
    
    const motivo = prompt('Ingresa el motivo de cancelación (opcional):');
    
    if (motivo !== null) { // null = usuario canceló el prompt
      this.ordenService.cancelarOrden(orden.id, motivo).subscribe({
        next: () => {
          alert('Orden cancelada exitosamente');
          this.loadOrdenes();
        },
        error: (err: any) => {
          console.error('Error al cancelar orden:', err);
          alert('Error al cancelar la orden');
        }
      });
    }
  }

  deleteOrden(orden: OrdenAplicacion): void {
    if (!orden.id) return;
    
    if (orden.estado === 'aplicada') {
      alert('No se puede eliminar una orden ya aplicada');
      return;
    }
    
    const confirmacion = confirm(
      `¿Estás seguro de eliminar la orden para "${orden.parcela?.nombre}"?`
    );
    
    if (confirmacion) {
      this.ordenService.deleteOrden(orden.id).subscribe({
        next: () => {
          alert('Orden eliminada exitosamente');
          this.loadOrdenes();
        },
        error: (err: any) => {
          console.error('Error al eliminar:', err);
          alert('Error al eliminar la orden');
        }
      });
    }
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'badge-warning';
      case 'aplicada': return 'badge-success';
      case 'cancelada': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  getParcelaNombre(parcelaId: number): string {
    const parcela = this.parcelas.find((p: Parcela) => p.id === parcelaId);
    return parcela ? parcela.nombre : 'Desconocida';
  }
}