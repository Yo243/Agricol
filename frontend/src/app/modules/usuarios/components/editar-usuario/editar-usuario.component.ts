import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service';
import { RolUsuario } from '../../../../models/usuario.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './editar-usuario.component.html',
  styleUrls: ['./editar-usuario.component.css']
})
export class EditarUsuarioComponent implements OnInit {

  private userService = inject(UsuariosService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  userId!: number;

  // Form model
  formData = {
    name: '',
    email: '',
    role: RolUsuario.USER,
    activo: true,
    password: ''
  };

  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit() {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.userId || isNaN(this.userId)) {
      this.errorMessage = 'ID de usuario inválido.';
      return;
    }

    this.loadUsuario();
  }

  // ======================================================
  // CARGAR USUARIO
  // ======================================================
  loadUsuario() {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getUsuario(this.userId).subscribe({
      next: (user) => {
        this.formData = {
          name: user.name,
          email: user.email,
          role: user.role,
          activo: Boolean(user.activo),
          password: ''
        };

        // Mensaje de debug solo en local
        if (environment.production === false) {
          console.log('%c[LOCALHOST] Usuario cargado:', 'color:#16a34a', this.formData);
        }

        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'No se pudo cargar el usuario.';
        if (!environment.production) console.error('[LOCALHOST ERROR]', err);
        this.loading = false;
      }
    });
  }

  // ======================================================
  // GUARDAR CAMBIOS
  // ======================================================
  guardar() {

    // ========= VALIDACIONES =========
    if (!this.formData.name.trim()) {
      this.errorMessage = 'El nombre es obligatorio.';
      return;
    }

    if (!this.validateEmail(this.formData.email)) {
      this.errorMessage = 'Ingresa un email válido.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: any = {
      name: this.formData.name.trim(),
      email: this.formData.email.trim(),
      role: this.formData.role,
      activo: this.formData.activo
    };

    if (this.formData.password.trim()) {
      payload.password = this.formData.password.trim();
    }

    // Debug solo en dev
    if (!environment.production) {
      console.log('%c[LOCALHOST] Payload enviado:', 'color:#0ea5e9', payload);
    }

    this.userService.actualizarUsuario(this.userId, payload).subscribe({
      next: () => {
        this.successMessage = 'Usuario actualizado correctamente.';
        this.saving = false;

        setTimeout(() => {
          this.router.navigate(['/usuarios']);
        }, 800);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al actualizar el usuario.';
        this.saving = false;

        if (!environment.production) {
          console.error('[LOCALHOST ERROR]', err);
        }
      }
    });
  }

  // ======================================================
  // CANCELAR
  // ======================================================
  cancelar() {
    if (confirm('¿Seguro que deseas cancelar? Los cambios no guardados se perderán.')) {
      this.router.navigate(['/usuarios']);
    }
  }

  // ======================================================
  // VALIDAR EMAIL
  // ======================================================
  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
}
