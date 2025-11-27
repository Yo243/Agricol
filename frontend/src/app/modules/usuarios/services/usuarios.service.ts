import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
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
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  getById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateUsuarioDto): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, data);
  }

  update(id: number, data: UpdateUsuarioDto): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  toggleEstado(id: number, activo: boolean): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}/estado`, { activo });
  }

  cambiarPassword(id: number, passwords: CambiarPasswordDto): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/${id}/password`, passwords);
  }

  getEstadisticas(): Observable<EstadisticasUsuarios> {
    return this.http.get<EstadisticasUsuarios>(`${this.apiUrl}/estadisticas`);
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
}
