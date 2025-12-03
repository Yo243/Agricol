// src/app/modules/parcela/services/parcela.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import {
  Parcela,
  Cultivo,
  PeriodoSiembra,
  AplicacionParcela,
  Receta,
  Actividad,
  CreateParcelaDto,
  CreatePeriodoSiembraDto,
  CreateAplicacionDto,
  FinalizarPeriodoDto,
  EstadisticasParcelas,
  ReporteProduccion,
  TrazabilidadParcela
} from '../../../models/parcela.model';

@Injectable({
  providedIn: 'root'
})
export class ParcelasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/parcelas`;

  // ==========================================
  // PARCELAS
  // ==========================================

  getParcelas(activo?: boolean, estado?: string): Observable<Parcela[]> {
    let params = new HttpParams();
    if (activo !== undefined) params = params.set('activo', activo.toString());
    if (estado) params = params.set('estado', estado);

    return this.http.get<Parcela[]>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getParcelaById(id: number): Observable<Parcela> {
    return this.http.get<Parcela>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createParcela(data: CreateParcelaDto): Observable<Parcela> {
    return this.http.post<Parcela>(this.apiUrl, data).pipe(
      catchError(this.handleError)
    );
  }

  updateParcela(id: number, data: Partial<CreateParcelaDto>): Observable<Parcela> {
    return this.http.put<Parcela>(`${this.apiUrl}/${id}`, data).pipe(
      catchError(this.handleError)
    );
  }

  deleteParcela(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // ==========================================
  // PERÍODOS DE SIEMBRA
  // ==========================================

  getPeriodosSiembra(parcelaId?: number, estado?: string): Observable<PeriodoSiembra[]> {
    let params = new HttpParams();
    if (parcelaId) params = params.set('parcelaId', parcelaId.toString());
    if (estado) params = params.set('estado', estado);
    
    return this.http.get<PeriodoSiembra[]>(`${this.apiUrl}/periodos/list`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  createPeriodoSiembra(data: CreatePeriodoSiembraDto): Observable<PeriodoSiembra> {
    return this.http.post<PeriodoSiembra>(`${this.apiUrl}/periodos`, data).pipe(
      catchError(this.handleError)
    );
  }

  updatePeriodoSiembra(id: number, data: Partial<CreatePeriodoSiembraDto>): Observable<PeriodoSiembra> {
    return this.http.put<PeriodoSiembra>(`${this.apiUrl}/periodos/${id}`, data).pipe(
      catchError(this.handleError)
    );
  }

  finalizarPeriodoSiembra(id: number, data: FinalizarPeriodoDto): Observable<PeriodoSiembra> {
    return this.http.patch<PeriodoSiembra>(`${this.apiUrl}/periodos/${id}/finalizar`, data).pipe(
      catchError(this.handleError)
    );
  }

  // ==========================================
  // APLICACIONES
  // ==========================================

  getAplicaciones(parcelaId?: number, periodoSiembraId?: number): Observable<AplicacionParcela[]> {
    let params = new HttpParams();
    if (parcelaId) params = params.set('parcelaId', parcelaId.toString());
    if (periodoSiembraId) params = params.set('periodoSiembraId', periodoSiembraId.toString());
    
    return this.http.get<AplicacionParcela[]>(`${this.apiUrl}/aplicaciones/list`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  registrarAplicacion(data: CreateAplicacionDto): Observable<AplicacionParcela> {
    return this.http.post<AplicacionParcela>(`${this.apiUrl}/aplicaciones`, data).pipe(
      catchError(this.handleError)
    );
  }

  // ==========================================
  // REPORTES Y ESTADÍSTICAS
  // ==========================================

  getEstadisticas(): Observable<EstadisticasParcelas> {
    return this.http.get<EstadisticasParcelas>(`${this.apiUrl}/estadisticas`).pipe(
      catchError(this.handleError)
    );
  }

  getReporteProduccion(
    parcelaId?: number,
    fechaInicio?: string,
    fechaFin?: string
  ): Observable<ReporteProduccion[]> {
    let params = new HttpParams();
    if (parcelaId) params = params.set('parcelaId', parcelaId.toString());
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    
    return this.http.get<ReporteProduccion[]>(`${this.apiUrl}/reporte-produccion`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getTrazabilidad(parcelaId: number): Observable<TrazabilidadParcela> {
    return this.http.get<TrazabilidadParcela>(`${this.apiUrl}/${parcelaId}/trazabilidad`).pipe(
      catchError(this.handleError)
    );
  }

  // ==========================================
  // CULTIVOS
  // ==========================================

  /**
   * Obtener todos los cultivos disponibles
   */
  getCultivos(): Observable<Cultivo[]> {
    return this.http
      .get<any>(`${environment.apiUrl}/cultivos`)
      .pipe(
        map((resp: any) => {
          console.log('Cultivos (respuesta cruda):', resp);

          // Soporta:
          //  - [ {...}, {...} ]
          //  - { data: [ {...}, {...} ] }
          const cultivos = Array.isArray(resp) ? resp : resp?.data ?? [];

          console.log('Cultivos procesados:', cultivos);
          return cultivos as Cultivo[];
        }),
        catchError(this.handleError)
      );
  }

  // ==========================================
  // MANEJO DE ERRORES
  // ==========================================

  private handleError(error: HttpErrorResponse) {
    console.error('Error en ParcelasService:', error);
    
    let message = 'Error en la operación de parcelas';
    
    if (error.status === 0) {
      message = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    } else if (error.status === 400) {
      message = error.error?.message || error.error?.error || 'Datos inválidos. Verifica la información.';
    } else if (error.status === 404) {
      message = 'Parcela no encontrada.';
    } else if (error.status === 409) {
      message = error.error?.message || 'Conflicto: La parcela no se puede procesar.';
    } else if (error.status === 422) {
      message = error.error?.message || 'No se puede completar la operación. Verifica los datos.';
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