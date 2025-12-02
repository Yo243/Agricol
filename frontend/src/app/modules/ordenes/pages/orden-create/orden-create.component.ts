// src/app/modules/orden-aplicacion/pages/orden-create/orden-create.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OrdenAplicacionService } from '../../services/orden-aplicacion.service';
import {
  CreateOrdenDto,
  Parcela,
  Receta,
  ValidacionStock,
  OrdenDetalle
} from '../../../../models/orden-aplicacion.model';

type ConfirmAction = 'crearSinValidar' | 'crearConStockInsuficiente' | null;

@Component({
  selector: 'app-orden-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './orden-create.component.html',
  styleUrls: ['./orden-create.component.css']
})
export class OrdenCreateComponent implements OnInit {

  private ordenService = inject(OrdenAplicacionService);
  private router = inject(Router);

  parcelas: Parcela[] = [];
  recetas: Receta[] = [];
  recetaSeleccionada?: Receta;

  orden: CreateOrdenDto = {
    parcelaId: 0,
    recetaId: 0,
    hectareasAplicadas: 0,
    fechaAplicacion: new Date(),
    observaciones: ''
  };

  /** String para el input date (YYYY-MM-DD) */
  fechaAplicacionStr = '';

  detallesCalculados: OrdenDetalle[] = [];
  costoTotal = 0;

  validacionStock?: ValidacionStock;
  mostrandoValidacion = false;

  loading = false;
  error = '';
  success = '';

  // ======== Modal de confirmación (para reemplazar confirm() feo) ========
  confirmModalVisible = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmDanger = false;
  confirmPrimaryLabel = 'Confirmar';
  confirmAction: ConfirmAction = null;

  ngOnInit(): void {
    this.loadParcelas();
    this.loadRecetas();

    // fecha hoy por defecto
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    this.orden.fechaAplicacion = hoy;
    this.fechaAplicacionStr = hoy.toISOString().split('T')[0];
  }

  // ================= CARGA DE PARCELAS Y RECETAS =================

  loadParcelas(): void {
    this.ordenService.getParcelas().subscribe({
      next: (resp: any) => {
        let parcelas: Parcela[] = [];

        if (Array.isArray(resp)) {
          parcelas = resp;
        } else if (Array.isArray(resp?.data)) {
          parcelas = resp.data;
        } else if (Array.isArray(resp?.parcelas)) {
          parcelas = resp.parcelas;
        } else {
          console.warn('⚠️ No se encontraron parcelas en la respuesta');
        }

        this.parcelas = parcelas.filter(p => p.activo !== false);
      },
      error: (err: any) => {
        console.error('Error al cargar parcelas:', err);
        this.error = 'Error al cargar parcelas';
        this.parcelas = [];
      }
    });
  }

  loadRecetas(): void {
    this.ordenService.getRecetas().subscribe({
      next: (resp: any) => {
        let recetas: Receta[] = [];

        if (Array.isArray(resp)) {
          recetas = resp;
        } else if (Array.isArray(resp?.data)) {
          recetas = resp.data;
        } else if (Array.isArray(resp?.recetas)) {
          recetas = resp.recetas;
        } else {
          console.warn('⚠️ No se encontraron recetas en la respuesta');
        }

        this.recetas = recetas.filter(r => r.activo !== false);
      },
      error: (err: any) => {
        console.error('Error al cargar recetas:', err);
        this.error = 'Error al cargar recetas';
        this.recetas = [];
      }
    });
  }

  // ================= LÓGICA DE RECETA / DETALLES =================

  onRecetaChange(): void {
    this.error = '';
    this.success = '';

    if (this.orden.recetaId === 0) {
      this.recetaSeleccionada = undefined;
      this.detallesCalculados = [];
      this.costoTotal = 0;
      return;
    }

    this.ordenService.getRecetaById(this.orden.recetaId).subscribe({
      next: (receta: Receta) => {
        this.recetaSeleccionada = receta;
        this.calcularDetalles();
      },
      error: (err: any) => {
        console.error('Error al cargar receta:', err);
        this.error = 'Error al cargar detalles de la receta';
      }
    });
  }

  onHectareasChange(): void {
    this.error = '';
    this.success = '';

    if (this.orden.hectareasAplicadas < 0) {
      this.orden.hectareasAplicadas = 0;
      this.error = 'Las hectáreas no pueden ser negativas.';
      this.detallesCalculados = [];
      this.costoTotal = 0;
      return;
    }

    const superficieParcela = this.getParcelaSuperficie(this.orden.parcelaId);
    if (this.orden.parcelaId && superficieParcela > 0 &&
        this.orden.hectareasAplicadas > superficieParcela) {
      this.error = `Las hectáreas aplicadas (${this.orden.hectareasAplicadas} ha) no pueden ser mayores que la superficie de la parcela (${superficieParcela} ha).`;
      this.detallesCalculados = [];
      this.costoTotal = 0;
      return;
    }

    this.calcularDetalles();
  }

  onFechaChange(value: string): void {
    this.fechaAplicacionStr = value;
    this.error = '';
    this.success = '';

    if (!value) {
      return;
    }

    const fecha = new Date(value + 'T00:00:00');
    if (Number.isNaN(fecha.getTime())) {
      this.error = 'Fecha de aplicación inválida.';
      return;
    }

    // Guardamos como Date en el DTO
    this.orden.fechaAplicacion = fecha;
  }

  calcularDetalles(): void {
    if (!this.recetaSeleccionada || this.orden.hectareasAplicadas <= 0) {
      this.detallesCalculados = [];
      this.costoTotal = 0;
      return;
    }

    this.detallesCalculados = this.ordenService.calcularDetallesOrden(
      this.recetaSeleccionada,
      this.orden.hectareasAplicadas
    ) || [];

    this.costoTotal = this.detallesCalculados.reduce(
      (total, detalle) => total + (detalle.costoTotal ?? 0),
      0
    );
  }

  // ================= VALIDAR STOCK =================

  validarStock(): void {
    this.error = '';
    this.success = '';

    if (this.orden.parcelaId === 0) {
      this.error = 'Debes seleccionar una parcela antes de validar el stock.';
      return;
    }

    if (this.orden.recetaId === 0) {
      this.error = 'Debes seleccionar una receta antes de validar el stock.';
      return;
    }

    if (this.orden.hectareasAplicadas <= 0) {
      this.error = 'Las hectáreas deben ser mayores a 0 para calcular los insumos.';
      return;
    }

    this.loading = true;
    this.mostrandoValidacion = false;

    this.ordenService
      .validarStock(this.orden.recetaId, this.orden.hectareasAplicadas)
      .subscribe({
        next: (validacion: ValidacionStock) => {
          this.validacionStock = validacion;
          this.mostrandoValidacion = true;
          this.loading = false;

          if (!validacion.esValido) {
            this.error = 'Stock insuficiente para algunos insumos';
          } else {
            this.success = '✓ Stock disponible para todos los insumos';
            setTimeout(() => (this.success = ''), 3000);
          }
        },
        error: (err: any) => {
          console.error('Error al validar stock:', err);
          this.error = 'Error al validar disponibilidad de stock';
          this.loading = false;
        }
      });
  }

  // ================= VALIDACIONES GENERALES FORM =================

  private validarFormularioBasico(): boolean {
    this.error = '';
    this.success = '';

    if (this.orden.parcelaId === 0) {
      this.error = 'Debes seleccionar una parcela.';
      return false;
    }

    if (this.orden.recetaId === 0) {
      this.error = 'Debes seleccionar una receta.';
      return false;
    }

    if (this.orden.hectareasAplicadas <= 0) {
      this.error = 'Las hectáreas deben ser mayor a 0.';
      return false;
    }

    const superficie = this.getParcelaSuperficie(this.orden.parcelaId);
    if (superficie > 0 && this.orden.hectareasAplicadas > superficie) {
      this.error = `Las hectáreas aplicadas no pueden ser mayores que la superficie de la parcela (${superficie} ha).`;
      return false;
    }

    if (!this.fechaAplicacionStr) {
      this.error = 'Debes seleccionar una fecha de aplicación.';
      return false;
    }

    const fecha = new Date(this.fechaAplicacionStr + 'T00:00:00');
    if (Number.isNaN(fecha.getTime())) {
      this.error = 'Fecha de aplicación inválida.';
      return false;
    }

    // Por si acaso, actualizamos el DTO
    this.orden.fechaAplicacion = fecha;
    return true;
  }

  // ================= MODAL DE CONFIRMACIÓN =================

  private openConfirm(
    action: ConfirmAction,
    opts: { title: string; message: string; danger?: boolean; primaryLabel?: string }
  ) {
    this.confirmAction = action;
    this.confirmTitle = opts.title;
    this.confirmMessage = opts.message;
    this.confirmDanger = !!opts.danger;
    this.confirmPrimaryLabel = opts.primaryLabel || 'Confirmar';
    this.confirmModalVisible = true;
  }

  closeConfirmModal(): void {
    this.confirmModalVisible = false;
    this.confirmAction = null;
  }

  onConfirmModal(): void {
    if (!this.confirmAction) {
      this.closeConfirmModal();
      return;
    }

    // En todos los casos, si llegó aquí, creamos la orden
    this.closeConfirmModal();
    this.ejecutarCrearOrden();
  }

  // ================= CREAR ORDEN =================

  onSubmit(): void {
    if (!this.validarFormularioBasico()) {
      return;
    }

    // Caso 1: nunca se llamó a validarStock => pedir confirmación
    if (!this.validacionStock) {
      this.openConfirm('crearSinValidar', {
        title: 'Crear orden sin validar stock',
        message:
          'No has validado el stock disponible.\n\n' +
          '¿Deseas crear la orden de todos modos?',
        danger: false,
        primaryLabel: 'Crear orden'
      });
      return;
    }

    // Caso 2: se validó, pero el stock es insuficiente => confirmación fuerte
    if (this.validacionStock && !this.validacionStock.esValido) {
      this.openConfirm('crearConStockInsuficiente', {
        title: 'Stock insuficiente',
        message:
          'El stock es insuficiente para algunos insumos.\n\n' +
          'Puedes crear la orden, pero quedará pendiente y no se podrá aplicar ' +
          'hasta tener stock suficiente.\n\n¿Deseas continuar?',
        danger: true,
        primaryLabel: 'Crear de todos modos'
      });
      return;
    }

    // Caso 3: todo OK y stock validado => crear directo
    this.ejecutarCrearOrden();
  }

  private ejecutarCrearOrden(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.ordenService.createOrden(this.orden).subscribe({
      next: (ordenCreada) => {
        this.loading = false;
        // Sin alert feo, simplemente navegamos al detalle
        this.router.navigate(['/ordenes', ordenCreada.id]);
      },
      error: (err: any) => {
        console.error('Error al crear orden:', err);
        this.error = err.error?.message || 'Error al crear la orden';
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/ordenes']);
  }

  getParcelaSuperficie(parcelaId: number): number {
    const parcela = this.parcelas.find((p: Parcela) => p.id === parcelaId);
    return parcela ? parcela.superficie : 0;
  }
}
