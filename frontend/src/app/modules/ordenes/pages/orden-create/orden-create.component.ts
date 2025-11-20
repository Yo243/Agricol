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
  costoTotal: number = 0;
  
  validacionStock?: ValidacionStock;
  mostrandoValidacion: boolean = false;
  
  loading: boolean = false;
  error: string = '';
  success: string = '';

  ngOnInit(): void {
    this.loadParcelas();
    this.loadRecetas();
    
    // Establecer fecha de hoy por defecto
    const today = new Date();
    this.orden.fechaAplicacion = today;
  }

  loadParcelas(): void {
    this.ordenService.getParcelas().subscribe({
      next: (data: Parcela[]) => {
        this.parcelas = data.filter(p => p.activo);
      },
      error: (err: any) => {
        console.error('Error al cargar parcelas:', err);
        this.error = 'Error al cargar parcelas';
      }
    });
  }

  loadRecetas(): void {
    this.ordenService.getRecetas().subscribe({
      next: (data: Receta[]) => {
        this.recetas = data.filter(r => r.activo);
      },
      error: (err: any) => {
        console.error('Error al cargar recetas:', err);
        this.error = 'Error al cargar recetas';
      }
    });
  }

  onRecetaChange(): void {
    if (this.orden.recetaId === 0) {
      this.recetaSeleccionada = undefined;
      this.detallesCalculados = [];
      this.costoTotal = 0;
      return;
    }

    // Cargar detalles de la receta
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

    this.costoTotal = this.detallesCalculados.reduce((total, detalle) => {
      return total + detalle.costoTotal;
    }, 0);
  }

  validarStock(): void {
    if (this.orden.recetaId === 0 || this.orden.hectareasAplicadas <= 0) {
      alert('Por favor selecciona una receta y especifica las hectáreas');
      return;
    }

    this.loading = true;
    this.mostrandoValidacion = false;

    this.ordenService.validarStock(this.orden.recetaId, this.orden.hectareasAplicadas).subscribe({
      next: (validacion: ValidacionStock) => {
        this.validacionStock = validacion;
        this.mostrandoValidacion = true;
        this.loading = false;

        if (!validacion.esValido) {
          this.error = 'Stock insuficiente para algunos insumos';
        } else {
          this.success = '✓ Stock disponible para todos los insumos';
          setTimeout(() => this.success = '', 3000);
        }
      },
      error: (err: any) => {
        console.error('Error al validar stock:', err);
        this.error = 'Error al validar disponibilidad de stock';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    // Validaciones
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

    // Verificar que se validó el stock
    if (!this.validacionStock) {
      const confirmar = confirm(
        'No has validado el stock disponible. ¿Deseas continuar de todos modos?'
      );
      if (!confirmar) return;
    }

    // Si el stock no es válido, confirmar
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