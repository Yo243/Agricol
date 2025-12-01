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

  detallesCalculados: OrdenDetalle[] = [];
  costoTotal = 0;

  validacionStock?: ValidacionStock;
  mostrandoValidacion = false;

  loading = false;
  error = '';
  success = '';

  ngOnInit(): void {
    this.loadParcelas();
    this.loadRecetas();

    // fecha hoy por defecto
    this.orden.fechaAplicacion = new Date();
  }

  // ================= CARGA DE PARCELAS Y RECETAS =================

  loadParcelas(): void {
    this.ordenService.getParcelas().subscribe({
      next: (resp: any) => {
        console.log('Parcelas (respuesta cruda):', resp);

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
        console.log('Parcelas procesadas:', this.parcelas);
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
        console.log('Recetas (respuesta cruda):', resp);

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
        console.log('Recetas procesadas:', this.recetas);
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
    this.calcularDetalles();
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
    );

    this.costoTotal = this.detallesCalculados.reduce(
      (total, detalle) => total + detalle.costoTotal,
      0
    );
  }

  // ================= VALIDAR STOCK =================

  validarStock(): void {
    if (this.orden.recetaId === 0 || this.orden.hectareasAplicadas <= 0) {
      alert('Por favor selecciona una receta y especifica las hectáreas');
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

  // ================= CREAR ORDEN =================

  onSubmit(): void {
    if (this.orden.parcelaId === 0) {
      this.error = 'Debes seleccionar una parcela';
      return;
    }

    if (this.orden.recetaId === 0) {
      this.error = 'Debes seleccionar una receta';
      return;
    }

    if (this.orden.hectareasAplicadas <= 0) {
      this.error = 'Las hectáreas deben ser mayor a 0';
      return;
    }

    if (!this.validacionStock) {
      const confirmar = confirm(
        'No has validado el stock disponible. ¿Deseas continuar de todos modos?'
      );
      if (!confirmar) return;
    }

    if (this.validacionStock && !this.validacionStock.esValido) {
      const confirmar = confirm(
        'El stock es insuficiente para algunos insumos. ¿Deseas crear la orden de todos modos?\n\n' +
          'Nota: La orden quedará pendiente y no se podrá aplicar hasta tener stock suficiente.'
      );
      if (!confirmar) return;
    }

    this.loading = true;
    this.error = '';

    this.ordenService.createOrden(this.orden).subscribe({
      next: (ordenCreada) => {
        alert(`Orden #${ordenCreada.id} creada exitosamente`);
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
