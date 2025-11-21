import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PeriodosSiembraService {
  private apiUrl = `${environment.apiUrl}/periodos-siembra`;

  constructor(private http: HttpClient) {}

  // CRUD básico
  getAll(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Cerrar período (finalizar ciclo)
  cerrarPeriodo(id: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/cerrar`, data);
  }

  // Obtener períodos activos
  getActivos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/activos`);
  }

  // Obtener períodos por parcela
  getPorParcela(parcelaId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/parcela/${parcelaId}`);
  }

  // Datos para formularios
  getParcelas(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/parcelas`);
  }

  getCultivos(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/cultivos`);
  }

  // Estadísticas del período
  getEstadisticas(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/estadisticas`);
  }
}