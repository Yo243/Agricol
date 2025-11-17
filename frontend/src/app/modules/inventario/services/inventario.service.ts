import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
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
  private apiUrl = 'http://localhost:3000/api/inventario';
  private inventarioSubject = new BehaviorSubject<InventarioItem[]>([]);
  public inventario$ = this.inventarioSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ============ ITEMS ============
  
  getItems(): Observable<InventarioItem[]> {
    return this.http.get<InventarioItem[]>(this.apiUrl)
      .pipe(tap(items => this.inventarioSubject.next(items)));
  }

  getItemById(id: number): Observable<InventarioItem> {
    return this.http.get<InventarioItem>(`${this.apiUrl}/${id}`);
  }

  createItem(item: Partial<InventarioItem>): Observable<InventarioItem> {
    return this.http.post<InventarioItem>(this.apiUrl, item);
  }

  updateItem(id: number, item: Partial<InventarioItem>): Observable<InventarioItem> {
    return this.http.put<InventarioItem>(`${this.apiUrl}/${id}`, item);
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ============ MOVIMIENTOS ============

  getMovimientos(itemId?: number): Observable<MovimientoInventario[]> {
    const url = itemId 
      ? `${this.apiUrl}/movimientos?itemId=${itemId}`
      : `${this.apiUrl}/movimientos`;
    return this.http.get<MovimientoInventario[]>(url);
  }

  registrarMovimiento(movimiento: Partial<MovimientoInventario>): Observable<MovimientoInventario> {
    return this.http.post<MovimientoInventario>(`${this.apiUrl}/movimientos`, movimiento);
  }

  // ============ ALERTAS ============

  getAlertas(): Observable<AlertaInventario[]> {
    return this.http.get<AlertaInventario[]>(`${this.apiUrl}/alertas`);
  }

  marcarAlertaLeida(alertaId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/alertas/${alertaId}/leer`, {});
  }

  // ============ REPORTES Y ESTADÍSTICAS ============

  getEstadisticas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/estadisticas`);
  }

  getItemsPorCategoria(categoria: CategoriaInventario): Observable<InventarioItem[]> {
    return this.http.get<InventarioItem[]>(`${this.apiUrl}/categoria/${categoria}`);
  }

  getItemsBajoStock(): Observable<InventarioItem[]> {
    return this.http.get<InventarioItem[]>(`${this.apiUrl}/bajo-stock`);
  }

  getItemsPorVencer(dias: number = 30): Observable<InventarioItem[]> {
    return this.http.get<InventarioItem[]>(`${this.apiUrl}/por-vencer?dias=${dias}`);
  }

  buscarItems(termino: string): Observable<InventarioItem[]> {
    return this.http.get<InventarioItem[]>(`${this.apiUrl}/buscar?q=${termino}`);
  }
}