// src/app/modules/receta/pages/receta-create-edit/receta-create-edit.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

import {
  Receta,
  RecetaDetalle,
  InsumoInventario,
  Cultivo,
  CreateRecetaDto,
  UpdateRecetaDto
} from '../../../../models/receta.model';

interface ApiResponse<T> {
  message: string;
  data: T;
}

@Component({
  selector: 'app-receta-create-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receta-create-edit.component.html',
  styleUrls: ['./receta-create-edit.component.css'],
})
export class RecetaCreateEditComponent implements OnInit {

  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  receta: Receta = {
    cultivoId: 0,
    nombre: '',
    descripcion: '',
    etapaCultivo: '',
    activo: true,
    detalles: []
  };

  cultivos: Cultivo[] = [];
  insumos: InsumoInventario[] = [];
  insumosDisponibles: InsumoInventario[] = [];

  isEditMode = false;
  loading = false;

  // Error “formal” del formulario
  error = '';

  // ✅ Feedback tipo localhost pero estilizado
  feedbackMessage = '';
  feedbackType: 'success' | 'error' | 'info' | '' = '';

  costoTotal = 0;

  nuevoDetalle: RecetaDetalle = {
    insumoId: 0,
    dosisPorHectarea: 0,
    unidadMedida: 'kg',
    orden: 1
  };

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];

    if (id) {
      this.isEditMode = true;
      this.cargarReceta(+id);
    }

    this.cargarCatalogos();
  }

  // ======================
  //   CARGA DE CATÁLOGOS
  // ======================

  cargarCatalogos(): void {
    // Cargar cultivos
    this.http.get<ApiResponse<Cultivo[]>>(`${environment.apiUrl}/recetas/cultivos`).subscribe({
      next: (response) => {
        this.cultivos = response.data;
      },
      error: (err) => {
        console.error('Error al cargar cultivos:', err);
        this.showFeedback('No se pudieron cargar los cultivos', 'error');
      }
    });

    // Cargar insumos del inventario
    this.http.get<any>(`${environment.apiUrl}/inventario`).subscribe({
      next: (response) => {
        this.insumos = response.data || response;
        this.actualizarInsumosDisponibles();
      },
      error: (err) => {
        console.error('Error al cargar insumos:', err);
        this.insumos = [];
        this.insumosDisponibles = [];
        this.showFeedback('No se pudieron cargar los insumos de inventario', 'error');
      }
    });
  }

  actualizarInsumosDisponibles(): void {
    const insumosEnUso = this.receta.detalles.map((d: RecetaDetalle) => d.insumoId);
    this.insumosDisponibles = this.insumos.filter(
      (insumo: InsumoInventario) => !insumosEnUso.includes(insumo.id)
    );
  }

  // ======================
  //   CARGAR RECETA (EDIT)
  // ======================

  cargarReceta(id: number): void {
    this.loading = true;
    this.error = '';

    this.http.get<ApiResponse<Receta>>(`${environment.apiUrl}/recetas/${id}`).subscribe({
      next: (response) => {
        this.receta = response.data;
        this.receta.detalles = response.data.detalles || [];
        this.actualizarInsumosDisponibles();
        this.costoTotal = this.calcularCostoTotal();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.error = 'No se pudo cargar la receta.';
        this.showFeedback('No se pudo cargar la receta', 'error');
        this.loading = false;
      }
    });
  }

  // ======================
  //        HELPERS
  // ======================

  getInsumoNombre(id: number): string {
    const insumo = this.insumos.find((i: InsumoInventario) => i.id === id);
    return insumo ? insumo.nombre : 'Desconocido';
  }

  getInsumoCosto(id: number): number {
    const insumo = this.insumos.find((i: InsumoInventario) => i.id === id);
    return insumo ? insumo.costoUnitario : 0;
  }

  // ======================
  //   CRUD DE INSUMOS
  // ======================

  agregarInsumo(): void {
    // ✅ Validaciones sin alert()
    if (this.nuevoDetalle.insumoId === 0) {
      this.showFeedback('Selecciona un insumo para agregarlo a la receta', 'error');
      return;
    }

    if (this.nuevoDetalle.dosisPorHectarea <= 0) {
      this.showFeedback('La dosis por hectárea debe ser mayor a 0', 'error');
      return;
    }

    this.receta.detalles.push({
      ...this.nuevoDetalle,
      orden: this.receta.detalles.length + 1
    });

    // Reset campo
    this.nuevoDetalle = {
      insumoId: 0,
      dosisPorHectarea: 0,
      unidadMedida: 'kg',
      orden: 1
    };

    this.actualizarInsumosDisponibles();
    this.costoTotal = this.calcularCostoTotal();
    this.showFeedback('Insumo agregado a la receta', 'success');
  }

  eliminarInsumo(index: number): void {
    this.receta.detalles.splice(index, 1);

    // Reordenar índices
    this.receta.detalles.forEach((d: RecetaDetalle, i: number) => {
      d.orden = i + 1;
    });

    this.actualizarInsumosDisponibles();
    this.costoTotal = this.calcularCostoTotal();
    this.showFeedback('Insumo eliminado de la receta', 'info');
  }

  moverInsumo(index: number, direccion: 'arriba' | 'abajo'): void {
    if (direccion === 'arriba' && index > 0) {
      [this.receta.detalles[index], this.receta.detalles[index - 1]] =
        [this.receta.detalles[index - 1], this.receta.detalles[index]];
    } else if (direccion === 'abajo' && index < this.receta.detalles.length - 1) {
      [this.receta.detalles[index], this.receta.detalles[index + 1]] =
        [this.receta.detalles[index + 1], this.receta.detalles[index]];
    }

    this.receta.detalles.forEach((d: RecetaDetalle, i: number) => {
      d.orden = i + 1;
    });
  }

  calcularCostoTotal(): number {
    return this.receta.detalles.reduce((sum: number, detalle: RecetaDetalle) => {
      const costo = this.getInsumoCosto(detalle.insumoId);
      return sum + (costo * detalle.dosisPorHectarea);
    }, 0);
  }

  // ======================
  //    SUBMIT / GUARDAR
  // ======================

  onSubmit(): void {
    // Validaciones básicas
    if (!this.receta.nombre.trim()) {
      this.error = 'El nombre de la receta es obligatorio';
      return;
    }

    if (this.receta.cultivoId === 0) {
      this.error = 'Debes seleccionar un cultivo';
      return;
    }

    if (this.receta.detalles.length === 0) {
      this.error = 'Debes agregar al menos un insumo a la receta.';
      return;
    }

    this.loading = true;
    this.error = '';

    const payload: CreateRecetaDto | UpdateRecetaDto = {
      cultivoId: this.receta.cultivoId,
      nombre: this.receta.nombre,
      descripcion: this.receta.descripcion,
      etapaCultivo: this.receta.etapaCultivo,
      detalles: this.receta.detalles.map((d: RecetaDetalle) => ({
        insumoId: d.insumoId,
        dosisPorHectarea: d.dosisPorHectarea,
        unidadMedida: d.unidadMedida,
        orden: d.orden
      }))
    };

    if (this.isEditMode && this.receta.id) {
      // UPDATE
      this.http.put(`${environment.apiUrl}/recetas/${this.receta.id}`, payload)
        .subscribe({
          next: () => {
            this.loading = false;
            this.showFeedback('Receta actualizada correctamente', 'success');
            this.router.navigate(['/receta']);
          },
          error: (err) => {
            console.error('Error:', err);
            this.error = 'Error al actualizar la receta.';
            this.showFeedback('Error al actualizar la receta', 'error');
            this.loading = false;
          }
        });
    } else {
      // CREATE
      this.http.post(`${environment.apiUrl}/recetas`, payload)
        .subscribe({
          next: () => {
            this.loading = false;
            this.showFeedback('Receta creada correctamente', 'success');
            this.router.navigate(['/receta']);
          },
          error: (err) => {
            console.error('Error:', err);
            this.error = 'Error al crear la receta.';
            this.showFeedback('Error al crear la receta', 'error');
            this.loading = false;
          }
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/receta']);
  }

  // ======================
  //     FEEDBACK HELPER
  // ======================

  private showFeedback(
    message: string,
    type: 'success' | 'error' | 'info' = 'info'
  ): void {
    this.feedbackMessage = message;
    this.feedbackType = type;

    setTimeout(() => {
      this.feedbackMessage = '';
      this.feedbackType = '';
    }, 3500);
  }
}
