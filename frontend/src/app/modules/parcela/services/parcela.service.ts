// src/app/modules/parcela/services/parcela.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // 👈 IMPORTANTE

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
  private apiUrl = 'http://localhost:3000/api/parcelas';

  constructor(private http: HttpClient) {}

  // ==========================================
  // PARCELAS
  // ==========================================

  getParcelas(activo?: boolean, estado?: string): Observable<Parcela[]> {
    let params = new HttpParams();
    if (activo !== undefined) params = params.set('activo', activo.toString());
    if (estado) params = params.set('estado', estado);

    return this.http.get<Parcela[]>(this.apiUrl, { params });
  }

  getParcelaById(id: number): Observable<Parcela> {
    return this.http.get<Parcela>(`${this.apiUrl}/${id}`);
  }

  createParcela(data: CreateParcelaDto): Observable<Parcela> {
    return this.http.post<Parcela>(this.apiUrl, data);
  }

  updateParcela(id: number, data: Partial<CreateParcelaDto>): Observable<Parcela> {
    return this.http.put<Parcela>(`${this.apiUrl}/${id}`, data);
  }

  deleteParcela(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  // ==========================================
  // PERÍODOS DE SIEMBRA
  // ==========================================

  getPeriodosSiembra(parcelaId?: number, estado?: string): Observable<PeriodoSiembra[]> {
    let params = new HttpParams();
    if (parcelaId) params = params.set('parcelaId', parcelaId.toString());
    if (estado) params = params.set('estado', estado);
    return this.http.get<PeriodoSiembra[]>(`${this.apiUrl}/periodos/list`, { params });
  }

  createPeriodoSiembra(data: CreatePeriodoSiembraDto): Observable<PeriodoSiembra> {
    return this.http.post<PeriodoSiembra>(`${this.apiUrl}/periodos`, data);
  }

  updatePeriodoSiembra(id: number, data: Partial<CreatePeriodoSiembraDto>): Observable<PeriodoSiembra> {
    return this.http.put<PeriodoSiembra>(`${this.apiUrl}/periodos/${id}`, data);
  }

  finalizarPeriodoSiembra(id: number, data: FinalizarPeriodoDto): Observable<PeriodoSiembra> {
    return this.http.patch<PeriodoSiembra>(`${this.apiUrl}/periodos/${id}/finalizar`, data);
  }

  // ==========================================
  // APLICACIONES
  // ==========================================

  getAplicaciones(parcelaId?: number, periodoSiembraId?: number): Observable<AplicacionParcela[]> {
    let params = new HttpParams();
    if (parcelaId) params = params.set('parcelaId', parcelaId.toString());
    if (periodoSiembraId) params = params.set('periodoSiembraId', periodoSiembraId.toString());
    return this.http.get<AplicacionParcela[]>(`${this.apiUrl}/aplicaciones/list`, { params });
  }

  registrarAplicacion(data: CreateAplicacionDto): Observable<AplicacionParcela> {
    return this.http.post<AplicacionParcela>(`${this.apiUrl}/aplicaciones`, data);
  }

  // ==========================================
  // REPORTES Y ESTADÍSTICAS
  // ==========================================

  getEstadisticas(): Observable<EstadisticasParcelas> {
    return this.http.get<EstadisticasParcelas>(`${this.apiUrl}/estadisticas`);
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
    return this.http.get<ReporteProduccion[]>(`${this.apiUrl}/reporte-produccion`, { params });
  }

  getTrazabilidad(parcelaId: number): Observable<TrazabilidadParcela> {
    return this.http.get<TrazabilidadParcela>(`${this.apiUrl}/${parcelaId}/trazabilidad`);
  }

  // ==========================================
  // CULTIVOS
  // ==========================================

  /**
   * Obtener todos los cultivos disponibles
   */
  getCultivos(): Observable<Cultivo[]> {
    return this.http
      .get<any>('http://localhost:3000/api/cultivos')
      .pipe(
        map((resp: any) => {
          console.log('Cultivos (respuesta cruda):', resp);

          // Soporta:
          //  - [ {...}, {...} ]
          //  - { data: [ {...}, {...} ] }
          const cultivos = Array.isArray(resp) ? resp : resp?.data ?? [];

          console.log('Cultivos procesados:', cultivos);
          return cultivos as Cultivo[];
        })
      );
  }
}
