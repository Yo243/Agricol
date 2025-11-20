// src/app/modules/ordenes/pages/orden-detail/orden-detail.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrdenAplicacionService } from '../../services/orden-aplicacion.service';
import { OrdenAplicacion } from '../../../../models/orden-aplicacion.model';

@Component({
  selector: 'app-orden-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orden-detail.component.html',
  styleUrls: ['./orden-detail.component.css']
})
export class OrdenDetailComponent implements OnInit {
  
  private ordenService = inject(OrdenAplicacionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  orden?: OrdenAplicacion;
  loading: boolean = false;
  error: string = '';

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadOrden(id);
      }
    });
  }

  loadOrden(id: number): void {
    this.loading = true;
    this.ordenService.getOrdenById(id).subscribe({
      next: (data: OrdenAplicacion) => {
        this.orden = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Error al cargar la orden';
        console.error('Error:', err);
        this.loading = false;
      }
    });
  }

  cerrarOrden(): void {
    if (!this.orden?.id) return;
    
    const confirmacion = confirm(
      `¿Cerrar la orden #${this.orden.id}?\n\nEsto descontará los insumos del inventario.`
    );
    
    if (confirmacion) {
      this.ordenService.cerrarOrden(this.orden.id).subscribe({
        next: (ordenActualizada: OrdenAplicacion) => {
          alert('Orden cerrada exitosamente. Inventario actualizado.');
          this.orden = ordenActualizada;
        },
        error: (err: any) => {
          console.error('Error al cerrar orden:', err);
          alert('Error al cerrar la orden: ' + (err.error?.message || 'Error desconocido'));
        }
      });
    }
  }

  cancelarOrden(): void {
    if (!this.orden?.id) return;
    
    const motivo = prompt('Ingresa el motivo de cancelación (opcional):');
    
    if (motivo !== null) {
      this.ordenService.cancelarOrden(this.orden.id, motivo).subscribe({
        next: (ordenActualizada: OrdenAplicacion) => {
          alert('Orden cancelada exitosamente');
          this.orden = ordenActualizada;
        },
        error: (err: any) => {
          console.error('Error al cancelar orden:', err);
          alert('Error al cancelar la orden');
        }
      });
    }
  }

  eliminarOrden(): void {
    if (!this.orden?.id) return;
    
    if (this.orden.estado === 'aplicada') {
      alert('No se puede eliminar una orden ya aplicada');
      return;
    }
    
    const confirmacion = confirm(
      `¿Estás seguro de eliminar la orden #${this.orden.id}?`
    );
    
    if (confirmacion) {
      this.ordenService.deleteOrden(this.orden.id).subscribe({
        next: () => {
          alert('Orden eliminada exitosamente');
          this.router.navigate(['/ordenes']);
        },
        error: (err: any) => {
          console.error('Error al eliminar:', err);
          alert('Error al eliminar la orden');
        }
      });
    }
  }

  backToList(): void {
    this.router.navigate(['/ordenes']);
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'badge-warning';
      case 'aplicada': return 'badge-success';
      case 'cancelada': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'aplicada': return 'Aplicada';
      case 'cancelada': return 'Cancelada';
      default: return estado;
    }
  }
}