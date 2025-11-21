import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private apiUrl = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  // Dashboard principal
  getDashboard(fechaInicio: string, fechaFin: string): Observable<any> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    return this.http.get(`${this.apiUrl}/dashboard`, { params });
  }

  // Reporte de consumo por cultivo
  getConsumoPorCultivo(fechaInicio?: string, fechaFin?: string): Observable<any> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http.get(`${this.apiUrl}/consumo-cultivo`, { params });
  }

  // Reporte de consumo por parcela
  getConsumoPorParcela(parcelaId?: number): Observable<any> {
    let params = new HttpParams();
    if (parcelaId) params = params.set('parcelaId', parcelaId.toString());

    return this.http.get(`${this.apiUrl}/consumo-parcela`, { params });
  }

  // Reporte de costos
  getCostos(fechaInicio: string, fechaFin: string, agruparPor: string = 'mes'): Observable<any> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin)
      .set('agruparPor', agruparPor);

    return this.http.get(`${this.apiUrl}/costos`, { params });
  }

  // Reporte de producción y rendimiento
  getProduccion(fechaInicio?: string, fechaFin?: string): Observable<any> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http.get(`${this.apiUrl}/produccion`, { params });
  }

  // Trazabilidad de parcela
  getTrazabilidadParcela(parcelaId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/trazabilidad/${parcelaId}`);
  }

  // Estadísticas generales
  getEstadisticasGenerales(): Observable<any> {
    return this.http.get(`${this.apiUrl}/estadisticas-generales`);
  }

  // Exportar a PDF
  exportarPDF(tipo: string, filtros: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportar-pdf`, {
      tipo,
      filtros
    }, {
      responseType: 'blob'
    });
  }

  // Exportar a Excel
  exportarExcel(tipo: string, filtros: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportar-excel`, {
      tipo,
      filtros
    }, {
      responseType: 'blob'
    });
  }
}