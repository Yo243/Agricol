// src/app/modules/receta/services/receta.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

// ✅ Aliases funcionando
import { Receta, CreateRecetaDto, UpdateRecetaDto, RecetaFilters, Cultivo } 
  from '../../../models/receta.model';

interface ApiResponse<T> {
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class RecetaService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/recetas`;

  // ============================
  // CRUD PRINCIPAL
  // ============================

  createReceta(receta: CreateRecetaDto): Observable<Receta> {
    return this.http
      .post<ApiResponse<Receta>>(this.apiUrl, receta)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  getRecetas(filters?: RecetaFilters): Observable<Receta[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.cultivoId) {
        params = params.set('cultivoId', filters.cultivoId.toString());
      }
      if (filters.etapaCultivo) {
        params = params.set('etapaCultivo', filters.etapaCultivo);
      }
      if (filters.activo !== undefined) {
        params = params.set('activo', filters.activo.toString());
      }
      if (filters.search) {
        params = params.set('search', filters.search);
      }
    }

    return this.http
      .get<ApiResponse<Receta[]>>(this.apiUrl, { params })
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  getRecetaById(id: number): Observable<Receta> {
    return this.http
      .get<ApiResponse<Receta>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  getRecetasByCultivo(cultivoId: number): Observable<Receta[]> {
    return this.http
      .get<ApiResponse<Receta[]>>(`${this.apiUrl}/cultivo/${cultivoId}`)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  updateReceta(id: number, receta: UpdateRecetaDto): Observable<Receta> {
    return this.http
      .put<ApiResponse<Receta>>(`${this.apiUrl}/${id}`, receta)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  deleteReceta(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // ============================
  // CATÁLOGOS
  // ============================

  getCultivos(): Observable<Cultivo[]> {
    return this.http
      .get<ApiResponse<Cultivo[]>>(`${this.apiUrl}/cultivos`)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  getEtapas(): Observable<string[]> {
    return this.http
      .get<ApiResponse<string[]>>(`${this.apiUrl}/etapas`)
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  // ============================
  // CÁLCULOS
  // ============================

  calcularCostoTotal(receta: Receta, hectareas: number): number {
    return receta.costoPorHectarea
      ? receta.costoPorHectarea * hectareas
      : 0;
  }

  calcularCantidadInsumo(dosisPorHa: number, hectareas: number): number {
    return dosisPorHa * hectareas;
  }

  // ============================
  // MANEJO DE ERRORES
  // ============================

  private handleError(error: HttpErrorResponse) {
    console.error('Error en RecetaService:', error);
    
    let message = 'Error en la operación de recetas';
    
    if (error.status === 0) {
      message = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    } else if (error.status === 400) {
      message = error.error?.message || error.error?.error || 'Datos inválidos. Verifica la información de la receta.';
    } else if (error.status === 404) {
      message = 'Receta no encontrada.';
    } else if (error.status === 409) {
      message = error.error?.message || 'Conflicto: La receta no se puede procesar. Puede estar en uso.';
    } else if (error.status === 422) {
      message = error.error?.message || 'Datos no válidos. Verifica los insumos y dosis.';
    } else if (error.status === 500) {
      message = 'Error en el servidor. Intenta más tarde.';
    } else if (error.error?.message) {
      message = error.error.message;
    } else if (error.error?.error) {
      message = error.error.error;
    }
    
    return throwError(() => ({ 
      message, 
      statusCode: error.status,
      details: error.error 
    }));
  }
}