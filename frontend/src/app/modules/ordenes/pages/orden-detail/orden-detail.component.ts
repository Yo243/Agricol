// src/app/modules/ordenes/pages/orden-detail/orden-detail.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrdenAplicacionService } from '../../services/orden-aplicacion.service';
import { OrdenAplicacion } from '../../../../models/orden-aplicacion.model';

type ConfirmAction = 'cerrar' | 'cancelar' | 'eliminar' | null;

@Component({
  selector: 'app-orden-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './orden-detail.component.html',
  styleUrls: ['./orden-detail.component.css']
})
export class OrdenDetailComponent implements OnInit {
  private ordenService = inject(OrdenAplicacionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  orden?: OrdenAplicacion;
  loading = false;
  error = '';
  successMessage = '';

  // Estado del modal de confirmación
  confirmModalVisible = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmDanger = false;
  confirmPrimaryLabel = 'Confirmar';
  confirmAction: ConfirmAction = null;

  // Campo opcional de motivo (para cancelar)
  showMotivoField = false;
  motivoCancelacion = '';
  motivoError = '';

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const idParam = params['id'];
      const id = Number(idParam);

      if (!idParam || Number.isNaN(id) || id <= 0) {
        this.error = 'Identificador de orden inválido';
        return;
      }

      this.loadOrden(id);
    });
  }

  loadOrden(id: number): void {
    this.loading = true;
    this.error = '';
    this.successMessage = '';

    this.ordenService.getOrdenById(id).subscribe({
      next: (data: OrdenAplicacion) => {
        if (!data) {
          this.error = 'No se encontró la orden solicitada';
          this.loading = false;
          return;
        }

        // Normalizar campos numéricos para evitar NaN/toFixed en undefined
        data.hectareasAplicadas = data.hectareasAplicadas ?? 0;
        data.costoTotal = data.costoTotal ?? 0;
        data.detalles = data.detalles ?? [];

        this.orden = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar orden:', err);
        this.error = err?.error?.message || 'Error al cargar la orden';
        this.loading = false;
      }
    });
  }

  // =========================
  // Validaciones de negocio
  // =========================

  get hasOrden(): boolean {
    return !!this.orden?.id;
  }

  /** Reglas para cerrar orden */
  get canCerrarOrden(): boolean {
    const o = this.orden;
    if (!o) return false;
    if (o.estado !== 'pendiente') return false;
    if (!o.detalles || o.detalles.length === 0) return false;
    if (!o.hectareasAplicadas || o.hectareasAplicadas <= 0) return false;
    if (o.costoTotal == null || o.costoTotal < 0) return false;

    const detalleInvalido = o.detalles.some(det => {
      const cantidad = det.cantidadCalculada;
      const costoUnit = det.costoUnitario;
      const costoTot = det.costoTotal;
      return (
        cantidad == null ||
        cantidad <= 0 ||
        costoUnit == null ||
        costoUnit < 0 ||
        costoTot == null ||
        costoTot < 0 ||
        !det.insumo
      );
    });

    return !detalleInvalido;
  }

  get canCancelarOrden(): boolean {
    const o = this.orden;
    if (!o) return false;
    return o.estado === 'pendiente';
  }

  get canEliminarOrden(): boolean {
    const o = this.orden;
    if (!o) return false;
    if (!o.id) return false;
    if (o.estado === 'aplicada') return false;
    return true;
  }

  get totalInsumos(): number {
    return this.orden?.detalles?.length ?? 0;
  }

  get costoPorHectarea(): number | null {
    if (!this.orden) return null;
    const hect = this.orden.hectareasAplicadas;
    const total = this.orden.costoTotal;

    if (!hect || hect <= 0 || total == null || total < 0) {
      return null;
    }
    return total / hect;
  }

  // =========================
  // Modal de confirmación
  // =========================

  private openConfirm(
    action: ConfirmAction,
    opts: { title: string; message: string; danger?: boolean; primaryLabel?: string; showMotivo?: boolean } 
  ) {
    this.confirmAction = action;
    this.confirmTitle = opts.title;
    this.confirmMessage = opts.message;
    this.confirmDanger = !!opts.danger;
    this.confirmPrimaryLabel = opts.primaryLabel || 'Confirmar';
    this.confirmModalVisible = true;
    this.showMotivoField = !!opts.showMotivo;
    this.motivoCancelacion = '';
    this.motivoError = '';
  }

  closeConfirmModal(): void {
    this.confirmModalVisible = false;
    this.confirmAction = null;
    this.motivoCancelacion = '';
    this.motivoError = '';
  }

  onConfirmModal(): void {
    if (!this.confirmAction || !this.orden?.id) {
      this.closeConfirmModal();
      return;
    }

    if (this.confirmAction === 'cancelar') {
      const motivo = this.motivoCancelacion.trim();
      if (motivo.length > 0 && motivo.length < 5) {
        this.motivoError = 'Si escribes un motivo, que sea mínimo de 5 caracteres.';
        return;
      }
      this.ejecutarCancelarOrden(motivo);
      return;
    }

    if (this.confirmAction === 'cerrar') {
      this.ejecutarCerrarOrden();
      return;
    }

    if (this.confirmAction === 'eliminar') {
      this.ejecutarEliminarOrden();
      return;
    }
  }

  // =========================
  // Acciones (click en botones)
  // =========================

  cerrarOrden(): void {
    if (!this.orden?.id) return;

    if (!this.canCerrarOrden) {
      this.error =
        'La orden no cumple con las condiciones para cerrarse. Revisa hectáreas, insumos y costos.';
      this.successMessage = '';
      return;
    }

    this.openConfirm('cerrar', {
      title: `Cerrar orden #${this.orden.id}`,
      message:
        'Al cerrar la orden se descontarán los insumos del inventario. Esta acción no se puede deshacer.',
      danger: false,
      primaryLabel: 'Cerrar y descontar'
    });
  }

  cancelarOrden(): void {
    if (!this.orden?.id) return;

    if (!this.canCancelarOrden) {
      this.error = 'Solo se pueden cancelar órdenes en estado pendiente.';
      this.successMessage = '';
      return;
    }

    this.openConfirm('cancelar', {
      title: `Cancelar orden #${this.orden.id}`,
      message: 'Puedes indicar un motivo de cancelación (opcional).',
      danger: true,
      primaryLabel: 'Confirmar cancelación',
      showMotivo: true
    });
  }

  eliminarOrden(): void {
    if (!this.orden?.id) return;

    if (!this.canEliminarOrden) {
      this.error = 'No se puede eliminar una orden ya aplicada.';
      this.successMessage = '';
      return;
    }

    this.openConfirm('eliminar', {
      title: `Eliminar orden #${this.orden.id}`,
      message: 'Esta acción eliminará la orden de forma permanente.',
      danger: true,
      primaryLabel: 'Eliminar orden'
    });
  }

  // =========================
  // Acciones (ejecución real)
  // =========================

  private ejecutarCerrarOrden(): void {
    if (!this.orden?.id) return;

    this.loading = true;
    this.error = '';
    this.successMessage = '';

    this.ordenService.cerrarOrden(this.orden.id).subscribe({
      next: (ordenActualizada: OrdenAplicacion) => {
        this.loading = false;
        this.closeConfirmModal();
        this.successMessage = 'Orden cerrada exitosamente. Inventario actualizado.';
        this.error = '';

        this.orden = {
          ...ordenActualizada,
          hectareasAplicadas: ordenActualizada.hectareasAplicadas ?? 0,
          costoTotal: ordenActualizada.costoTotal ?? 0,
          detalles: ordenActualizada.detalles ?? []
        };
      },
      error: (err: any) => {
        console.error('Error al cerrar orden:', err);
        this.loading = false;
        this.closeConfirmModal();
        this.error = err?.error?.message || 'Error al cerrar la orden';
        this.successMessage = '';
      }
    });
  }

  private ejecutarCancelarOrden(motivo: string): void {
    if (!this.orden?.id) return;

    this.loading = true;
    this.error = '';
    this.successMessage = '';

    this.ordenService.cancelarOrden(this.orden.id, motivo).subscribe({
      next: (ordenActualizada: OrdenAplicacion) => {
        this.loading = false;
        this.closeConfirmModal();
        this.successMessage = 'Orden cancelada exitosamente.';
        this.error = '';
        this.orden = ordenActualizada;
      },
      error: (err: any) => {
        console.error('Error al cancelar orden:', err);
        this.loading = false;
        this.closeConfirmModal();
        this.error = err?.error?.message || 'Error al cancelar la orden';
        this.successMessage = '';
      }
    });
  }

  private ejecutarEliminarOrden(): void {
    if (!this.orden?.id) return;

    this.loading = true;
    this.error = '';
    this.successMessage = '';

    this.ordenService.deleteOrden(this.orden.id).subscribe({
      next: () => {
        this.loading = false;
        this.closeConfirmModal();
        // Aquí solo navegamos; el mensaje de éxito podría ir en la lista
        this.router.navigate(['/ordenes']);
      },
      error: (err: any) => {
        console.error('Error al eliminar:', err);
        this.loading = false;
        this.closeConfirmModal();
        this.error = err?.error?.message || 'Error al eliminar la orden';
        this.successMessage = '';
      }
    });
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
