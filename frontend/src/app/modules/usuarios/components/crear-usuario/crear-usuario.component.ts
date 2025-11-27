import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service';
import { CreateUsuarioDto, RolUsuario } from '../../../../models/usuario.model'; 
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './crear-usuario.component.html',
  styleUrls: ['./crear-usuario.component.css']
})
export class CrearUsuarioComponent implements OnInit {

  private userService = inject(UsuariosService);
  private router = inject(Router);
  private auth = inject(AuthService);

  // Datos del formulario
  formData = {
    name: '',
    email: '',
    password: '',
    role: 'user' as RolUsuario,
    activo: true
  };

  loading = false;
  errorMessage = '';

  ngOnInit() {
    // Verificar que el usuario actual sea admin
    const currentUser = this.auth.getCurrentUser();

    if (!currentUser || currentUser.role !== 'admin') {
      this.router.navigate(['/usuarios']);
    }
  }

  crear() {
    // Limpiar mensaje de error previo
    this.errorMessage = '';

    // Validaciones básicas
    if (!this.formData.name.trim()) {
      this.errorMessage = 'El nombre es requerido';
      return;
    }

    if (!this.formData.email.trim()) {
      this.errorMessage = 'El correo electrónico es requerido';
      return;
    }

    if (!this.formData.password || this.formData.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) {
      this.errorMessage = 'El formato del correo electrónico no es válido';
      return;
    }

    this.loading = true;

    // Crear el DTO para enviar al backend
    const payload: CreateUsuarioDto = {
      name: this.formData.name.trim(),
      email: this.formData.email.trim().toLowerCase(),
      password: this.formData.password,
      role: this.formData.role
    };

    this.userService.crearUsuario(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/usuarios']);
      },
      error: err => {
        this.loading = false;
        
        // Manejo de errores específicos
        if (err?.error?.message) {
          this.errorMessage = err.error.message;
        } else if (err?.error?.error) {
          this.errorMessage = err.error.error;
        } else if (err?.status === 409) {
          this.errorMessage = 'Ya existe un usuario con este correo electrónico';
        } else if (err?.status === 400) {
          this.errorMessage = 'Los datos proporcionados no son válidos';
        } else {
          this.errorMessage = 'Error al crear el usuario. Por favor, intenta nuevamente.';
        }
        
        console.error('Error al crear usuario:', err);
      }
    });
  }

  cancelar() {
    this.router.navigate(['/usuarios']);
  }
}