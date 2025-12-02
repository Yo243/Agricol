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

type ListConfirmType = 'cerrar' | 'cancelar' | 'eliminar' | null;

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
  success: string = '';

  // Estadísticas rápidas
  totalOrdenes: number = 0;
  ordenesPendientes: number = 0;
  ordenesAplicadas: number = 0;
  costoTotalOrdenes: number = 0;

  // Loading por acción (para deshabilitar botones si quieres)
  accionLoadingId: number | null = null;

  // ====== Modal de confirmación / motivo ======
  confirmModalVisible = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmDanger = false;
  confirmPrimaryLabel = 'Confirmar';
  confirmType: ListConfirmType = null;
  confirmOrden?: OrdenAplicacion;
  cancelMotivo: string = '';

  ngOnInit(): void {
    this.loadParcelas();
    this.loadOrdenes();
  }

  loadOrdenes(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.ordenService.getOrdenes(this.filters).subscribe({
      next: (data: OrdenAplicacion[]) => {
        this.ordenes = data || [];
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
        this.parcelas = (data || []).filter(p => p.activo !== false);
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
    this.costoTotalOrdenes = this.ordenes.reduce(
      (acc, o) => acc + (o.costoTotal ?? 0),
      0
    );
  }

  onSearch(): void {
    this.filters.search = this.searchTerm?.trim() || undefined;
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

  // ============== MODAL HELPERS ==============

  private openConfirm(orden: OrdenAplicacion, type: ListConfirmType) {
    this.confirmOrden = orden;
    this.confirmType = type;
    this.cancelMotivo = '';

    if (type === 'cerrar') {
      this.confirmTitle = `Cerrar orden #${orden.id}`;
      this.confirmMessage =
        `¿Cerrar la orden para "${orden.parcela?.nombre}"?\n\n` +
        `Esto descontará los insumos del inventario.`;
      this.confirmDanger = false;
      this.confirmPrimaryLabel = 'Cerrar orden';
    } else if (type === 'cancelar') {
      this.confirmTitle = `Cancelar orden #${orden.id}`;
      this.confirmMessage =
        `¿Seguro que deseas cancelar la orden para "${orden.parcela?.nombre}"?\n\n` +
        `Puedes agregar un motivo (opcional).`;
      this.confirmDanger = true;
      this.confirmPrimaryLabel = 'Cancelar orden';
    } else if (type === 'eliminar') {
      this.confirmTitle = `Eliminar orden #${orden.id}`;
      this.confirmMessage =
        `¿Estás seguro de eliminar la orden para "${orden.parcela?.nombre}"?\n\n` +
        `Esta acción no se puede deshacer.`;
      this.confirmDanger = true;
      this.confirmPrimaryLabel = 'Eliminar orden';
    } else {
      return;
    }

    this.confirmModalVisible = true;
  }

  closeConfirmModal(): void {
    this.confirmModalVisible = false;
    this.confirmType = null;
    this.confirmOrden = undefined;
    this.cancelMotivo = '';
  }

  onConfirmModal(): void {
    if (!this.confirmOrden || !this.confirmType) {
      this.closeConfirmModal();
      return;
    }

    const orden = this.confirmOrden;
    const type = this.confirmType;

    this.closeConfirmModal();
    this.accionLoadingId = orden.id ?? null;
    this.error = '';
    this.success = '';

    if (type === 'cerrar') {
      this.ejecutarCerrarOrden(orden);
    } else if (type === 'cancelar') {
      this.ejecutarCancelarOrden(orden, this.cancelMotivo);
    } else if (type === 'eliminar') {
      this.ejecutarDeleteOrden(orden);
    }
  }

  // ============== ACCIONES ==============

  cerrarOrden(orden: OrdenAplicacion): void {
    if (!orden.id) return;

    if (orden.estado !== 'pendiente') {
      this.error = 'Solo se pueden cerrar órdenes en estado pendiente.';
      return;
    }

    this.openConfirm(orden, 'cerrar');
  }

  private ejecutarCerrarOrden(orden: OrdenAplicacion): void {
    this.ordenService.cerrarOrden(orden.id!).subscribe({
      next: () => {
        this.success = 'Orden cerrada exitosamente. Inventario actualizado.';
        this.accionLoadingId = null;
        this.loadOrdenes();
      },
      error: (err: any) => {
        console.error('Error al cerrar orden:', err);
        this.error =
          'Error al cerrar la orden: ' +
          (err.error?.message || 'Error desconocido');
        this.accionLoadingId = null;
      }
    });
  }

  cancelarOrden(orden: OrdenAplicacion): void {
    if (!orden.id) return;

    if (orden.estado !== 'pendiente') {
      this.error = 'Solo se pueden cancelar órdenes en estado pendiente.';
      return;
    }

    this.openConfirm(orden, 'cancelar');
  }

  private ejecutarCancelarOrden(orden: OrdenAplicacion, motivo: string): void {
    this.ordenService.cancelarOrden(orden.id!, motivo || '').subscribe({
      next: () => {
        this.success = 'Orden cancelada exitosamente.';
        this.accionLoadingId = null;
        this.loadOrdenes();
      },
      error: (err: any) => {
        console.error('Error al cancelar orden:', err);
        this.error = err.error?.message || 'Error al cancelar la orden.';
        this.accionLoadingId = null;
      }
    });
  }

  deleteOrden(orden: OrdenAplicacion): void {
    if (!orden.id) return;

    if (orden.estado === 'aplicada') {
      this.error = 'No se puede eliminar una orden ya aplicada.';
      return;
    }

    this.openConfirm(orden, 'eliminar');
  }

  private ejecutarDeleteOrden(orden: OrdenAplicacion): void {
    this.ordenService.deleteOrden(orden.id!).subscribe({
      next: () => {
        this.success = 'Orden eliminada exitosamente.';
        this.accionLoadingId = null;
        this.loadOrdenes();
      },
      error: (err: any) => {
        console.error('Error al eliminar:', err);
        this.error = err.error?.message || 'Error al eliminar la orden.';
        this.accionLoadingId = null;
      }
    });
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'pendiente':
        return 'badge-warning';
      case 'aplicada':
        return 'badge-success';
      case 'cancelada':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  getParcelaNombre(parcelaId: number): string {
    const parcela = this.parcelas.find((p: Parcela) => p.id === parcelaId);
    return parcela ? parcela.nombre : 'Desconocida';
  }
}
