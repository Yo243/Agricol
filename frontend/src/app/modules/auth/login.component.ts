import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Credenciales
  email: string = '';
  password: string = '';

  // Estados
  loading: boolean = false;
  showPassword: boolean = false;
  
  // Mensajes de error
  errorMessage: string = '';
  errorType: 'inactive' | 'credentials' | 'server' | '' = '';

  /**
   * Maneja el submit del formulario
   */
  onSubmit(): void {
    // Limpiar errores previos
    this.errorMessage = '';
    this.errorType = '';

    // Validaciones básicas
    if (!this.email || !this.password) {
      this.showError('Por favor completa todos los campos', 'credentials');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.showError('Por favor ingresa un email válido', 'credentials');
      return;
    }

    this.login();
  }

  /**
   * Realiza el login
   */
  private login(): void {
    this.loading = true;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        this.loading = false;
        
        // Redirigir al dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.loading = false;

        // Determinar tipo de error
        if (error.statusCode === 403) {
          // ✅ CUENTA INACTIVA
          this.showError(error.message, 'inactive');
        } else if (error.statusCode === 401) {
          // Credenciales incorrectas
          this.showError(error.message, 'credentials');
        } else {
          // Otros errores
          this.showError(error.message, 'server');
        }
      }
    });
  }

  /**
   * Muestra un mensaje de error
   */
  private showError(message: string, type: 'inactive' | 'credentials' | 'server'): void {
    this.errorMessage = message;
    this.errorType = type;
  }

  /**
   * Toggle para mostrar/ocultar contraseña
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Valida formato de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Limpia el mensaje de error
   */
  clearError(): void {
    this.errorMessage = '';
    this.errorType = '';
  }
}