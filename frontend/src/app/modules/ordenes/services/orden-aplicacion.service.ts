// src/app/modules/orden-aplicacion/services/orden-aplicacion.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  OrdenAplicacion,
  CreateOrdenDto,
  UpdateOrdenDto,
  OrdenFilters,
  Parcela,
  Receta,
  ValidacionStock
} from '../../../models/orden-aplicacion.model';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class OrdenAplicacionService {
  
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ordenes-aplicacion`;

  // ==================== CRUD BÁSICO ====================

  createOrden(orden: CreateOrdenDto): Observable<OrdenAplicacion> {
    return this.http.post<ApiResponse<OrdenAplicacion>>(this.apiUrl, orden)
      .pipe(map(response => response.data));
  }

  getOrdenes(filters?: OrdenFilters): Observable<OrdenAplicacion[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.parcelaId) {
        params = params.set('parcelaId', filters.parcelaId.toString());
      }
      if (filters.recetaId) {
        params = params.set('recetaId', filters.recetaId.toString());
      }
      if (filters.estado) {
        params = params.set('estado', filters.estado);
      }
      if (filters.fechaDesde) {
        params = params.set('fechaDesde', filters.fechaDesde.toISOString());
      }
      if (filters.fechaHasta) {
        params = params.set('fechaHasta', filters.fechaHasta.toISOString());
      }
      if (filters.search) {
        params = params.set('search', filters.search);
      }
    }

    return this.http.get<ApiResponse<OrdenAplicacion[]>>(this.apiUrl, { params })
      .pipe(map(response => response.data));
  }

  getOrdenById(id: number): Observable<OrdenAplicacion> {
    return this.http.get<ApiResponse<OrdenAplicacion>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  updateOrden(id: number, orden: UpdateOrdenDto): Observable<OrdenAplicacion> {
    return this.http.put<ApiResponse<OrdenAplicacion>>(`${this.apiUrl}/${id}`, orden)
      .pipe(map(response => response.data));
  }

  deleteOrden(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ==================== OPERACIONES ESPECIALES ====================

  cerrarOrden(id: number): Observable<OrdenAplicacion> {
    return this.http.post<ApiResponse<OrdenAplicacion>>(`${this.apiUrl}/${id}/cerrar`, {})
      .pipe(map(response => response.data));
  }

  cancelarOrden(id: number, motivo?: string): Observable<OrdenAplicacion> {
    return this.http.post<ApiResponse<OrdenAplicacion>>(`${this.apiUrl}/${id}/cancelar`, { motivo })
      .pipe(map(response => response.data));
  }

  validarStock(recetaId: number, hectareas: number): Observable<ValidacionStock> {
    return this.http.post<ApiResponse<ValidacionStock>>(`${this.apiUrl}/validar-stock`, {
      recetaId,
      hectareas
    }).pipe(map(response => response.data));
  }

  // ==================== DATOS RELACIONADOS ====================
  // 👇 AQUÍ VIENE LA PARTE IMPORTANTE

  getParcelas(): Observable<Parcela[]> {
    return this.http.get<any>(`${environment.apiUrl}/parcelas`).pipe(
      map((resp: any) => {
        // Soporta:
        //  - [ ... ]
        //  - { data: [ ... ] }
        //  - { parcelas: [ ... ] }
        if (Array.isArray(resp)) return resp as Parcela[];
        if (Array.isArray(resp?.data)) return resp.data as Parcela[];
        if (Array.isArray(resp?.parcelas)) return resp.parcelas as Parcela[];
        return [];
      })
    );
  }

  getRecetas(): Observable<Receta[]> {
    return this.http.get<any>(`${environment.apiUrl}/recetas`).pipe(
      map((resp: any) => {
        if (Array.isArray(resp)) return resp as Receta[];
        if (Array.isArray(resp?.data)) return resp.data as Receta[];
        if (Array.isArray(resp?.recetas)) return resp.recetas as Receta[];
        return [];
      })
    );
  }

  getRecetaById(id: number): Observable<Receta> {
    return this.http.get<any>(`${environment.apiUrl}/recetas/${id}`).pipe(
      map((resp: any) => {
        // Puede venir como objeto directo o envuelto en { data: obj }
        if (resp?.data) return resp.data as Receta;
        return resp as Receta;
      })
    );
  }

  // ==================== CÁLCULOS ====================

  calcularConsumo(dosisPorHectarea: number, hectareas: number): number {
    return dosisPorHectarea * hectareas;
  }

  calcularCostoTotal(orden: OrdenAplicacion): number {
    if (!orden.detalles || orden.detalles.length === 0) return 0;
    
    return orden.detalles.reduce((total, detalle) => {
      return total + detalle.costoTotal;
    }, 0);
  }

  calcularDetallesOrden(receta: Receta, hectareas: number): any[] {
    if (!receta.detalles || receta.detalles.length === 0) return [];

    return receta.detalles.map(detalle => {
      const cantidadCalculada = this.calcularConsumo(detalle.dosisPorHectarea, hectareas);
      const costoUnitario = detalle.insumo?.costoUnitario || 0;
      
      return {
        insumoId: detalle.insumoId,
        insumo: detalle.insumo,
        cantidadCalculada,
        unidadMedida: detalle.unidadMedida,
        costoUnitario,
        costoTotal: cantidadCalculada * costoUnitario
      };
    });
  }

  // ==================== REPORTES ====================

  getHistorialParcela(parcelaId: number): Observable<OrdenAplicacion[]> {
    return this.http.get<ApiResponse<OrdenAplicacion[]>>(
      `${this.apiUrl}/historial/parcela/${parcelaId}`
    ).pipe(map(response => response.data));
  }

  getEstadisticasPeriodo(fechaInicio: Date, fechaFin: Date): Observable<any> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio.toISOString())
      .set('fechaFin', fechaFin.toISOString());

    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/estadisticas`, { params })
      .pipe(map(response => response.data));
  }
}
