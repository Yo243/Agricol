import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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
} from '../../../models/parcelas.model';

@Injectable({
  providedIn: 'root'
})
export class ParcelasService {
  private apiUrl = 'http://localhost:3000/api/parcelas';

  constructor(private http: HttpClient) {}

  // ==========================================
  // PARCELAS
  // ==========================================

  /**
   * Obtener todas las parcelas con filtros opcionales
   * @param activo - Filtrar por estado activo/inactivo
   * @param estado - Filtrar por estado específico
   */
  getParcelas(activo?: boolean, estado?: string): Observable<Parcela[]> {
    let params = new HttpParams();
    if (activo !== undefined) params = params.set('activo', activo.toString());
    if (estado) params = params.set('estado', estado);
    return this.http.get<Parcela[]>(this.apiUrl, { params });
  }

  /**
   * Obtener una parcela por ID
   * @param id - ID de la parcela
   */
  getParcelaById(id: number): Observable<Parcela> {
    return this.http.get<Parcela>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear una nueva parcela
   * @param data - Datos de la parcela
   */
  createParcela(data: CreateParcelaDto): Observable<Parcela> {
    return this.http.post<Parcela>(this.apiUrl, data);
  }

  /**
   * Actualizar una parcela existente
   * @param id - ID de la parcela
   * @param data - Datos a actualizar
   */
  updateParcela(id: number, data: Partial<CreateParcelaDto>): Observable<Parcela> {
    return this.http.put<Parcela>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Eliminar una parcela (soft delete)
   * @param id - ID de la parcela
   */
  deleteParcela(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  // ==========================================
  // PERÍODOS DE SIEMBRA
  // ==========================================

  /**
   * Obtener períodos de siembra con filtros opcionales
   * @param parcelaId - Filtrar por parcela
   * @param estado - Filtrar por estado
   */
  getPeriodosSiembra(parcelaId?: number, estado?: string): Observable<PeriodoSiembra[]> {
    let params = new HttpParams();
    if (parcelaId) params = params.set('parcelaId', parcelaId.toString());
    if (estado) params = params.set('estado', estado);
    return this.http.get<PeriodoSiembra[]>(`${this.apiUrl}/periodos/list`, { params });
  }

  /**
   * Crear un nuevo período de siembra
   * @param data - Datos del período
   */
  createPeriodoSiembra(data: CreatePeriodoSiembraDto): Observable<PeriodoSiembra> {
    return this.http.post<PeriodoSiembra>(`${this.apiUrl}/periodos`, data);
  }

  /**
   * Actualizar un período de siembra
   * @param id - ID del período
   * @param data - Datos a actualizar
   */
  updatePeriodoSiembra(id: number, data: Partial<CreatePeriodoSiembraDto>): Observable<PeriodoSiembra> {
    return this.http.put<PeriodoSiembra>(`${this.apiUrl}/periodos/${id}`, data);
  }

  /**
   * Finalizar un período de siembra (registrar cosecha)
   * @param id - ID del período
   * @param data - Datos de finalización (fecha cosecha, rendimiento real)
   */
  finalizarPeriodoSiembra(id: number, data: FinalizarPeriodoDto): Observable<PeriodoSiembra> {
    return this.http.patch<PeriodoSiembra>(`${this.apiUrl}/periodos/${id}/finalizar`, data);
  }

  // ==========================================
  // APLICACIONES
  // ==========================================

  /**
   * Obtener aplicaciones con filtros opcionales
   * @param parcelaId - Filtrar por parcela
   * @param periodoSiembraId - Filtrar por período de siembra
   */
  getAplicaciones(parcelaId?: number, periodoSiembraId?: number): Observable<AplicacionParcela[]> {
    let params = new HttpParams();
    if (parcelaId) params = params.set('parcelaId', parcelaId.toString());
    if (periodoSiembraId) params = params.set('periodoSiembraId', periodoSiembraId.toString());
    return this.http.get<AplicacionParcela[]>(`${this.apiUrl}/aplicaciones/list`, { params });
  }

  /**
   * Registrar una nueva aplicación
   * IMPORTANTE: Descuenta automáticamente del inventario
   * @param data - Datos de la aplicación (incluye insumos)
   */
  registrarAplicacion(data: CreateAplicacionDto): Observable<AplicacionParcela> {
    return this.http.post<AplicacionParcela>(`${this.apiUrl}/aplicaciones`, data);
  }

  // ==========================================
  // REPORTES Y ESTADÍSTICAS
  // ==========================================

  /**
   * Obtener estadísticas generales de parcelas
   */
  getEstadisticas(): Observable<EstadisticasParcelas> {
    return this.http.get<EstadisticasParcelas>(`${this.apiUrl}/estadisticas`);
  }

  /**
   * Obtener reporte de producción con filtros
   * @param parcelaId - Filtrar por parcela
   * @param fechaInicio - Fecha inicio del rango
   * @param fechaFin - Fecha fin del rango
   */
  getReporteProduccion(parcelaId?: number, fechaInicio?: string, fechaFin?: string): Observable<ReporteProduccion[]> {
    let params = new HttpParams();
    if (parcelaId) params = params.set('parcelaId', parcelaId.toString());
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);
    return this.http.get<ReporteProduccion[]>(`${this.apiUrl}/reporte-produccion`, { params });
  }

  /**
   * Obtener trazabilidad completa de una parcela
   * Incluye todos los períodos, aplicaciones y eventos cronológicos
   * @param parcelaId - ID de la parcela
   */
  getTrazabilidad(parcelaId: number): Observable<TrazabilidadParcela> {
    return this.http.get<TrazabilidadParcela>(`${this.apiUrl}/${parcelaId}/trazabilidad`);
  }

  // ==========================================
  // MÉTODOS AUXILIARES PARA CULTIVOS
  // ==========================================

  /**
   * Obtener todos los cultivos disponibles
   * Nota: Este endpoint debería estar en un servicio de cultivos,
   * pero lo incluimos aquí por conveniencia
   */
  getCultivos(): Observable<Cultivo[]> {
    return this.http.get<Cultivo[]>('http://localhost:3000/api/cultivos');
  }
}