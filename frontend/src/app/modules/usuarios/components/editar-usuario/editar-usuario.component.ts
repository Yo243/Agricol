import { Component, inject, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service';
import { RolUsuario } from '../../../../models/usuario.model';

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

  formData: {
    name: string;
    email: string;
    role: RolUsuario;
    activo: boolean;
    password?: string;
  } = {
    name: '',
    email: '',
    role: RolUsuario.USER,
    activo: true,
    password: ''
  };

  loading = false;
  saving = false;
  errorMessage = '';

  ngOnInit() {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (!this.userId || isNaN(this.userId)) {
      this.errorMessage = 'ID de usuario inválido';
      return;
    }

    this.loadUsuario();
  }

  /**
   * Carga los datos del usuario desde el backend
   */
  loadUsuario() {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getUsuario(this.userId).subscribe({
      next: (user) => {
        console.log('Usuario cargado:', user);
        
        // IMPORTANTE: Convertir explícitamente el estado a boolean
        this.formData = {
          name: user.name,
          email: user.email,
          role: user.role,
          activo: user.activo === false ? false : true, // Conversión explícita
          password: '' // No mostrar contraseña real
        };

        console.log('FormData inicializado:', this.formData);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuario:', error);
        this.errorMessage = 'No se pudo cargar el usuario';
        this.loading = false;
      }
    });
  }

  /**
   * Guarda los cambios del usuario
   */
  guardar() {
    // Validaciones
    if (!this.formData.name || !this.formData.email) {
      this.errorMessage = 'Por favor completa todos los campos obligatorios';
      return;
    }

    if (!this.validateEmail(this.formData.email)) {
      this.errorMessage = 'Por favor ingresa un email válido';
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    // Preparar payload - IMPORTANTE: Convertir activo a boolean explícitamente
    const payload: any = {
      name: this.formData.name,
      email: this.formData.email,
      role: this.formData.role,
      activo: this.formData.activo === true ? true : false // Conversión explícita
    };

    // Solo incluir password si se proporcionó
    if (this.formData.password && this.formData.password.trim() !== '') {
      payload.password = this.formData.password;
    }

    console.log('Enviando payload:', payload);

    this.userService.actualizarUsuario(this.userId, payload).subscribe({
      next: (response) => {
        console.log('Usuario actualizado:', response);
        this.router.navigate(['/usuarios']);
      },
      error: (error) => {
        console.error('Error al actualizar usuario:', error);
        this.errorMessage = error.error?.message || 'Error al actualizar el usuario';
        this.saving = false;
      }
    });
  }

  /**
   * Cancela la edición y vuelve a la lista
   */
  cancelar() {
    if (confirm('¿Estás seguro de cancelar? Los cambios no guardados se perderán.')) {
      this.router.navigate(['/usuarios']);
    }
  }

  /**
   * Valida formato de email
   */
  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
}