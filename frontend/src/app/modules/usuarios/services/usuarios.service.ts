import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { 
  Usuario, 
  CreateUsuarioDto, 
  UpdateUsuarioDto, 
  CambiarPasswordDto, 
  EstadisticasUsuarios 
} from '../../../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  // =============================
  // MÉTODOS ORIGINALES (BACKEND)
  // =============================

  getAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  create(data: CreateUsuarioDto): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, data).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, data: UpdateUsuarioDto): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, data).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  toggleEstado(id: number, activo: boolean): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}/estado`, { activo }).pipe(
      catchError(this.handleError)
    );
  }

  cambiarPassword(id: number, passwords: CambiarPasswordDto): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/${id}/password`, passwords).pipe(
      catchError(this.handleError)
    );
  }

  getEstadisticas(): Observable<EstadisticasUsuarios> {
    return this.http.get<EstadisticasUsuarios>(`${this.apiUrl}/estadisticas`).pipe(
      catchError(this.handleError)
    );
  }

  // =============================
  // ALIAS PARA QUE TUS COMPONENTES NO TRUENEN
  // =============================

  /** Alias de getAll() */
  getUsuarios(): Observable<Usuario[]> {
    return this.getAll();
  }

  /** Alias de getById() */
  getUsuario(id: number): Observable<Usuario> {
    return this.getById(id);
  }

  /** Alias de create() */
  crearUsuario(data: CreateUsuarioDto): Observable<Usuario> {
    return this.create(data);
  }

  /** Alias de update() */
  actualizarUsuario(id: number, data: UpdateUsuarioDto): Observable<Usuario> {
    return this.update(id, data);
  }

  /** Alias de delete() */
  eliminarUsuario(id: number): Observable<{ message: string }> {
    return this.delete(id);
  }

  /** Alias de toggleEstado() */
  cambiarEstado(id: number, activo: boolean): Observable<Usuario> {
    return this.toggleEstado(id, activo);
  }

  // =============================
  // MANEJO DE ERRORES
  // =============================

  private handleError(error: HttpErrorResponse) {
    console.error('Error en UsuariosService:', error);
    
    let message = 'Error en la operación de usuarios';
    
    if (error.status === 0) {
      message = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    } else if (error.status === 400) {
      message = error.error?.message || error.error?.error || 'Datos inválidos. Verifica la información del usuario.';
    } else if (error.status === 401) {
      message = 'No autorizado. Verifica tus credenciales.';
    } else if (error.status === 403) {
      message = 'No tienes permisos para realizar esta acción.';
    } else if (error.status === 404) {
      message = 'Usuario no encontrado.';
    } else if (error.status === 409) {
      message = error.error?.message || 'Conflicto: El email ya está registrado o el usuario no se puede eliminar.';
    } else if (error.status === 422) {
      message = error.error?.message || 'Datos no válidos. Verifica el formato del email y la contraseña.';
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