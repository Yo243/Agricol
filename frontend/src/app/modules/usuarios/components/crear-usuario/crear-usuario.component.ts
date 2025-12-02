import { Component, inject, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service';
import { CreateUsuarioDto, RolUsuario } from '../../../../models/usuario.model'; 
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './crear-usuario.component.html',
  styleUrls: ['./crear-usuario.component.css']
})
export class CrearUsuarioComponent implements OnInit {

  private userService = inject(UsuariosService);
  private router = inject(Router);
  private auth = inject(AuthService);

  // MODAL de confirmación al cancelar
  confirmCancelVisible = false;

  formData = {
    name: '',
    email: '',
    password: '',
    role: RolUsuario.USER,
    activo: true
  };

  loading = false;
  errorMessage = '';
  submitted = false;

  ngOnInit() {
    const currentUser = this.auth.getCurrentUser();

    if (!currentUser || currentUser.role !== 'admin') {
      this.router.navigate(['/usuarios']);
    }
  }

  crear() {
    this.submitted = true;
    this.errorMessage = '';

    // Validaciones
    if (!this.formData.name.trim()) {
      this.errorMessage = 'El nombre es obligatorio';
      return;
    }

    if (!this.formData.email.trim()) {
      this.errorMessage = 'El correo electrónico es obligatorio';
      return;
    }

    if (!this.validateEmail(this.formData.email)) {
      this.errorMessage = 'El correo no tiene un formato válido';
      return;
    }

    if (!this.formData.password || this.formData.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener mínimo 6 caracteres';
      return;
    }

    this.loading = true;

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
      error: (err) => {
        this.loading = false;

        if (err?.error?.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'No se pudo crear el usuario';
        }
      }
    });
  }

  cancelar() {
    if (this.hasUnsavedChanges()) {
      this.confirmCancelVisible = true;
      return;
    }

    this.router.navigate(['/usuarios']);
  }

  confirmarCancelar() {
    this.confirmCancelVisible = false;
    this.router.navigate(['/usuarios']);
  }

  cerrarCancelar() {
    this.confirmCancelVisible = false;
  }

  hasUnsavedChanges(): boolean {
    return !!(
      this.formData.name ||
      this.formData.email ||
      this.formData.password
    );
  }

  // 🔥 HAZLA PÚBLICA!!
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
