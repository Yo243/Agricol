// src/app/modules/receta/services/receta.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

// ✅ Aliases funcionando
import { Receta, CreateRecetaDto, UpdateRecetaDto, RecetaFilters, Cultivo } 
  from '../../../models/receta.model';

import { environment } from '../../../environments/environment';

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
      .pipe(map(res => res.data));
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
      .pipe(map(res => res.data));
  }

  getRecetaById(id: number): Observable<Receta> {
    return this.http
      .get<ApiResponse<Receta>>(`${this.apiUrl}/${id}`)
      .pipe(map(res => res.data));
  }

  getRecetasByCultivo(cultivoId: number): Observable<Receta[]> {
    return this.http
      .get<ApiResponse<Receta[]>>(`${this.apiUrl}/cultivo/${cultivoId}`)
      .pipe(map(res => res.data));
  }

  updateReceta(id: number, receta: UpdateRecetaDto): Observable<Receta> {
    return this.http
      .put<ApiResponse<Receta>>(`${this.apiUrl}/${id}`, receta)
      .pipe(map(res => res.data));
  }

  deleteReceta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ============================
  // CATÁLOGOS
  // ============================

  getCultivos(): Observable<Cultivo[]> {
    return this.http
      .get<ApiResponse<Cultivo[]>>(`${this.apiUrl}/cultivos`)
      .pipe(map(res => res.data));
  }

  getEtapas(): Observable<string[]> {
    return this.http
      .get<ApiResponse<string[]>>(`${this.apiUrl}/etapas`)
      .pipe(map(res => res.data));
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
}
