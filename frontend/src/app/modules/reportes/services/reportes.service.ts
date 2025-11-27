import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
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
  private apiUrl = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  // Dashboard
  getDashboard(fechaInicio?: string, fechaFin?: string): Observable<DashboardResponse> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http.get<DashboardResponse>(`${this.apiUrl}/dashboard`, { params });
  }

  // Consumo por cultivo
  getConsumoPorCultivo(fechaInicio?: string, fechaFin?: string): Observable<ConsumoCultivoItem[]> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http.get<ConsumoCultivoItem[]>(`${this.apiUrl}/consumo-cultivo`, { params });
  }

  // Consumo por parcela
  getConsumoPorParcela(parcelaId?: number): Observable<ConsumoParcelaItem[]> {
    let params = new HttpParams();
    if (parcelaId) params = params.set('parcelaId', parcelaId.toString());

    return this.http.get<ConsumoParcelaItem[]>(`${this.apiUrl}/consumo-parcela`, { params });
  }

  // Costos por fecha
  getCostos(fechaInicio: string, fechaFin: string, agruparPor: string = 'mes'): Observable<CostosResponseItem[]> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin)
      .set('agruparPor', agruparPor);

    return this.http.get<CostosResponseItem[]>(`${this.apiUrl}/costos`, { params });
  }

  // Costos por hectárea
  getCostosPorHectarea(periodoId: number): Observable<CostosHectareaResponse> {
    const params = new HttpParams().set('periodoId', periodoId.toString());
    return this.http.get<CostosHectareaResponse>(`${this.apiUrl}/costos-hectarea`, { params });
  }

  // Trazabilidad
  getTrazabilidadParcela(parcelaId: number): Observable<TrazabilidadResponse> {
    return this.http.get<TrazabilidadResponse>(`${this.apiUrl}/trazabilidad/${parcelaId}`);
  }

  // Alertas
  getAlertas(): Observable<AlertaInventario[]> {
    return this.http.get<AlertaInventario[]>(`${this.apiUrl}/alertas`);
  }
}
