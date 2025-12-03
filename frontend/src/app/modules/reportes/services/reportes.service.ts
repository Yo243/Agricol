import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { 
  DashboardResponse,
  ConsumoCultivoItem,
  ConsumoParcelaItem,
  CostosResponseItem,
  CostosHectareaResponse,
  TrazabilidadResponse,
  AlertaInventario
} from '../../../models/reportes.model';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reportes`;

  // Dashboard
  getDashboard(fechaInicio?: string, fechaFin?: string): Observable<DashboardResponse> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http.get<DashboardResponse>(`${this.apiUrl}/dashboard`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  // Consumo por cultivo
  getConsumoPorCultivo(fechaInicio?: string, fechaFin?: string): Observable<ConsumoCultivoItem[]> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http.get<ConsumoCultivoItem[]>(`${this.apiUrl}/consumo-cultivo`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  // Consumo por parcela
  getConsumoPorParcela(parcelaId?: number): Observable<ConsumoParcelaItem[]> {
    let params = new HttpParams();
    if (parcelaId) params = params.set('parcelaId', parcelaId.toString());

    return this.http.get<ConsumoParcelaItem[]>(`${this.apiUrl}/consumo-parcela`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  // Costos por fecha
  getCostos(fechaInicio: string, fechaFin: string, agruparPor: string = 'mes'): Observable<CostosResponseItem[]> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin)
      .set('agruparPor', agruparPor);

    return this.http.get<CostosResponseItem[]>(`${this.apiUrl}/costos`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  // Costos por hectárea
  getCostosPorHectarea(periodoId: number): Observable<CostosHectareaResponse> {
    const params = new HttpParams().set('periodoId', periodoId.toString());
    
    return this.http.get<CostosHectareaResponse>(`${this.apiUrl}/costos-hectarea`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  // Trazabilidad
  getTrazabilidadParcela(parcelaId: number): Observable<TrazabilidadResponse> {
    return this.http.get<TrazabilidadResponse>(`${this.apiUrl}/trazabilidad/${parcelaId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Alertas
  getAlertas(): Observable<AlertaInventario[]> {
    return this.http.get<AlertaInventario[]>(`${this.apiUrl}/alertas`).pipe(
      catchError(this.handleError)
    );
  }

  // Manejo de errores
  private handleError(error: HttpErrorResponse) {
    console.error('Error en ReportesService:', error);
    
    let message = 'Error al generar el reporte';
    
    if (error.status === 0) {
      message = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    } else if (error.status === 400) {
      message = error.error?.message || error.error?.error || 'Parámetros inválidos para el reporte.';
    } else if (error.status === 404) {
      message = 'No se encontraron datos para el reporte solicitado.';
    } else if (error.status === 422) {
      message = error.error?.message || 'Rango de fechas inválido para el reporte.';
    } else if (error.status === 500) {
      message = 'Error en el servidor al generar el reporte. Intenta más tarde.';
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