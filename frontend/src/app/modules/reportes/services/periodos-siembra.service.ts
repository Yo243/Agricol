import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PeriodosSiembraService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/periodos-siembra`;

  // CRUD básico
  getAll(): Observable<any> {
    return this.http.get(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // ✅ Alias para que funcione tu componente sin errores
  getPeriodoById(id: number): Observable<any> {
    return this.getById(id);
  }

  create(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Cerrar período (finalizar ciclo)
  cerrarPeriodo(id: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/cerrar`, data).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener períodos activos
  getActivos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/activos`).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener períodos por parcela
  getPorParcela(parcelaId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/parcela/${parcelaId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Datos para formularios
  getParcelas(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/parcelas`).pipe(
      catchError(this.handleError)
    );
  }

  getCultivos(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/cultivos`).pipe(
      catchError(this.handleError)
    );
  }

  // Estadísticas del período
  getEstadisticas(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/estadisticas`).pipe(
      catchError(this.handleError)
    );
  }

  // Manejo de errores
  private handleError(error: HttpErrorResponse) {
    console.error('Error en PeriodosSiembraService:', error);
    
    let message = 'Error en la operación de períodos de siembra';
    
    if (error.status === 0) {
      message = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    } else if (error.status === 400) {
      message = error.error?.message || error.error?.error || 'Datos inválidos. Verifica la información del período.';
    } else if (error.status === 404) {
      message = 'Período de siembra no encontrado.';
    } else if (error.status === 409) {
      message = error.error?.message || 'Conflicto: El período no se puede modificar o ya existe uno activo.';
    } else if (error.status === 422) {
      message = error.error?.message || 'No se puede cerrar el período. Verifica los datos de producción.';
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