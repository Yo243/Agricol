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
  error = '';
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

  cargarCatalogos(): void {
    // Cargar cultivos
    this.http.get<ApiResponse<Cultivo[]>>(`${environment.apiUrl}/recetas/cultivos`).subscribe({
      next: (response) => {
        this.cultivos = response.data;
      },
      error: (err) => {
        console.error('Error al cargar cultivos:', err);
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
      }
    });
  }

  actualizarInsumosDisponibles(): void {
    const insumosEnUso = this.receta.detalles.map((d: RecetaDetalle) => d.insumoId);
    this.insumosDisponibles = this.insumos.filter(
      (insumo: InsumoInventario) => !insumosEnUso.includes(insumo.id)
    );
  }

  cargarReceta(id: number): void {
    this.loading = true;

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
        this.loading = false;
      }
    });
  }

  getInsumoNombre(id: number): string {
    const insumo = this.insumos.find((i: InsumoInventario) => i.id === id);
    return insumo ? insumo.nombre : 'Desconocido';
  }

  getInsumoCosto(id: number): number {
    const insumo = this.insumos.find((i: InsumoInventario) => i.id === id);
    return insumo ? insumo.costoUnitario : 0;
  }

  agregarInsumo(): void {
    if (this.nuevoDetalle.insumoId === 0) {
      alert('Por favor selecciona un insumo');
      return;
    }

    if (this.nuevoDetalle.dosisPorHectarea <= 0) {
      alert('La dosis debe ser mayor a 0');
      return;
    }

    this.receta.detalles.push({
      ...this.nuevoDetalle,
      orden: this.receta.detalles.length + 1
    });

    this.nuevoDetalle = {
      insumoId: 0,
      dosisPorHectarea: 0,
      unidadMedida: 'kg',
      orden: 1
    };

    this.actualizarInsumosDisponibles();
    this.costoTotal = this.calcularCostoTotal();
  }

  eliminarInsumo(index: number): void {
    this.receta.detalles.splice(index, 1);
    this.receta.detalles.forEach((d: RecetaDetalle, i: number) => {
      d.orden = i + 1;
    });
    this.actualizarInsumosDisponibles();
    this.costoTotal = this.calcularCostoTotal();
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

  onSubmit(): void {
    if (!this.receta.nombre.trim()) {
      this.error = 'El nombre es requerido';
      return;
    }

    if (this.receta.cultivoId === 0) {
      this.error = 'Debes seleccionar un cultivo';
      return;
    }

    if (this.receta.detalles.length === 0) {
      this.error = 'Debes agregar al menos un insumo.';
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
      this.http.put(`${environment.apiUrl}/recetas/${this.receta.id}`, payload)
        .subscribe({
          next: () => {
            alert('Receta actualizada exitosamente');
            this.router.navigate(['/receta']);
          },
          error: (err) => {
            console.error('Error:', err);
            this.error = 'Error al actualizar la receta.';
            this.loading = false;
          }
        });
    } else {
      this.http.post(`${environment.apiUrl}/recetas`, payload)
        .subscribe({
          next: () => {
            alert('Receta creada exitosamente');
            this.router.navigate(['/receta']);
          },
          error: (err) => {
            console.error('Error:', err);
            this.error = 'Error al crear la receta.';
            this.loading = false;
          }
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/receta']);
  }
}