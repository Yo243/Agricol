import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    activo: boolean;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Cargar usuario del localStorage si existe
    const user = this.getUserFromStorage();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  /**
   * Login con manejo de errores mejorado
   */
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          // Guardar token y usuario
          this.saveAuthData(response);
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(() => this.handleLoginError(error));
        })
      );
  }

  /**
   * Maneja errores de login con mensajes amigables
   */
  private handleLoginError(error: HttpErrorResponse): { message: string; statusCode: number } {
    console.error('Error en login:', error);

    let message = 'Error al iniciar sesión. Intenta nuevamente.';
    const statusCode = error.status;

    if (error.status === 403) {
      // ✅ CUENTA DESACTIVADA
      message = error.error?.error || 
                error.error?.message || 
                'Tu cuenta ha sido desactivada. Contacta al administrador para más información.';
    } else if (error.status === 401) {
      // Credenciales incorrectas
      message = 'Email o contraseña incorrectos. Verifica tus datos.';
    } else if (error.status === 500) {
      // Error del servidor
      message = 'Error en el servidor. Intenta más tarde.';
    } else if (error.status === 0) {
      // Sin conexión
      message = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    }

    return { message, statusCode };
  }

  /**
   * Guarda datos de autenticación
   */
  private saveAuthData(response: LoginResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  /**
   * Logout
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Obtiene el token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  /**
   * Obtiene usuario del localStorage
   */
  private getUserFromStorage(): any {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Verifica si está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Verifica si es admin
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }
}