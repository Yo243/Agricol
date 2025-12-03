import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  InventarioItem, 
  MovimientoInventario, 
  AlertaInventario,
  CategoriaInventario 
} from '../../../models/inventario.model';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/inventario`;
  
  private inventarioSubject = new BehaviorSubject<InventarioItem[]>([]);
  public inventario$ = this.inventarioSubject.asObservable();

  // ============ ITEMS ============
  
  getItems(): Observable<InventarioItem[]> {
    return this.http.get<InventarioItem[]>(this.apiUrl).pipe(
      tap(items => this.inventarioSubject.next(items)),
      catchError(this.handleError)
    );
  }

  getItemById(id: number): Observable<InventarioItem> {
    return this.http.get<InventarioItem>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createItem(item: Partial<InventarioItem>): Observable<InventarioItem> {
    return this.http.post<InventarioItem>(this.apiUrl, item).pipe(
      tap(() => this.refreshItems()),
      catchError(this.handleError)
    );
  }

  updateItem(id: number, item: Partial<InventarioItem>): Observable<InventarioItem> {
    return this.http.put<InventarioItem>(`${this.apiUrl}/${id}`, item).pipe(
      tap(() => this.refreshItems()),
      catchError(this.handleError)
    );
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refreshItems()),
      catchError(this.handleError)
    );
  }

  // ============ MOVIMIENTOS ============

  getMovimientos(itemId?: number): Observable<MovimientoInventario[]> {
    const url = itemId 
      ? `${this.apiUrl}/movimientos?itemId=${itemId}`
      : `${this.apiUrl}/movimientos`;
    return this.http.get<MovimientoInventario[]>(url).pipe(
      catchError(this.handleError)
    );
  }

  registrarMovimiento(movimiento: Partial<MovimientoInventario>): Observable<MovimientoInventario> {
    return this.http.post<MovimientoInventario>(`${this.apiUrl}/movimientos`, movimiento).pipe(
      tap(() => this.refreshItems()),
      catchError(this.handleError)
    );
  }

  // ============ ALERTAS ============

  getAlertas(): Observable<AlertaInventario[]> {
    return this.http.get<AlertaInventario[]>(`${this.apiUrl}/alertas`).pipe(
      catchError(this.handleError)
    );
  }

  marcarAlertaLeida(alertaId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/alertas/${alertaId}/leer`, {}).pipe(
      catchError(this.handleError)
    );
  }

  // ============ REPORTES Y ESTADÍSTICAS ============

  getEstadisticas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/estadisticas`).pipe(
      catchError(this.handleError)
    );
  }

  getItemsPorCategoria(categoria: CategoriaInventario): Observable<InventarioItem[]> {
    return this.http.get<InventarioItem[]>(`${this.apiUrl}/categoria/${categoria}`).pipe(
      catchError(this.handleError)
    );
  }

  getItemsBajoStock(): Observable<InventarioItem[]> {
    return this.http.get<InventarioItem[]>(`${this.apiUrl}/bajo-stock`).pipe(
      catchError(this.handleError)
    );
  }

  getItemsPorVencer(dias: number = 30): Observable<InventarioItem[]> {
    return this.http.get<InventarioItem[]>(`${this.apiUrl}/por-vencer?dias=${dias}`).pipe(
      catchError(this.handleError)
    );
  }

  buscarItems(termino: string): Observable<InventarioItem[]> {
    return this.http.get<InventarioItem[]>(`${this.apiUrl}/buscar?q=${termino}`).pipe(
      catchError(this.handleError)
    );
  }

  // ============ MÉTODOS AUXILIARES ============

  /**
   * Refresca la lista de items después de una operación
   */
  private refreshItems(): void {
    this.getItems().subscribe();
  }

  /**
   * Maneja errores HTTP con mensajes amigables
   */
  private handleError(error: HttpErrorResponse) {
    console.error('Error en InventarioService:', error);
    
    let message = 'Error en la operación de inventario';
    
    if (error.status === 0) {
      message = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    } else if (error.status === 400) {
      message = error.error?.message || 'Datos inválidos. Verifica la información.';
    } else if (error.status === 404) {
      message = 'Item de inventario no encontrado.';
    } else if (error.status === 409) {
      message = 'Conflicto: El item ya existe o no se puede eliminar.';
    } else if (error.status === 500) {
      message = 'Error en el servidor. Intenta más tarde.';
    } else if (error.error?.message) {
      message = error.error.message;
    }
    
    return throwError(() => ({ message, statusCode: error.status }));
  }

  /**
   * Limpia el estado del servicio (útil para logout)
   */
  clearState(): void {
    this.inventarioSubject.next([]);
  }
}