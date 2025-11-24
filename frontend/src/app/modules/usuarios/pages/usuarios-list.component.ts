import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../.../../services/usuarios.service';
import { Usuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './usuarios-list.component.html',
  styleUrls: ['./usuarios-list.component.css']
})
export class UsuariosListComponent implements OnInit {
  private usuariosService = inject(UsuariosService);
  private router = inject(Router);

  usuarios: Usuario[] = [];
  loading: boolean = true;
  errorMessage: string = '';

  // Estadísticas
  totalUsuarios: number = 0;
  totalAdministradores: number = 0;
  totalOperadores: number = 0;
  usuariosActivos: number = 0;

  // Filtros
  filtroNombre: string = '';
  filtroRol: string = '';
  filtroEstado: string = '';

  ngOnInit(): void {
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.loading = true;
    this.usuariosService.getAll().subscribe({
      next: (data: Usuario[]) => {
        this.usuarios = data;
        this.calcularEstadisticas();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar usuarios:', error);
        this.errorMessage = 'Error al cargar los usuarios';
        this.loading = false;
      }
    });
  }

  calcularEstadisticas(): void {
    this.totalUsuarios = this.usuarios.length;
    this.totalAdministradores = this.usuarios.filter(u => u.role === 'admin').length;
    this.totalOperadores = this.usuarios.filter(u => u.role === 'user').length;
    this.usuariosActivos = this.usuarios.filter(u => u.activo !== false).length;
  }

  get usuariosFiltrados(): Usuario[] {
    return this.usuarios.filter(usuario => {
      const matchNombre = !this.filtroNombre || 
        usuario.name.toLowerCase().includes(this.filtroNombre.toLowerCase()) ||
        usuario.email.toLowerCase().includes(this.filtroNombre.toLowerCase());
      
      const matchRol = !this.filtroRol || usuario.role === this.filtroRol;
      
      const matchEstado = !this.filtroEstado || 
        (this.filtroEstado === 'activo' && usuario.activo !== false) ||
        (this.filtroEstado === 'inactivo' && usuario.activo === false);

      return matchNombre && matchRol && matchEstado;
    });
  }

  getRolLabel(role: string): string {
    return role === 'admin' ? 'Administrador' : 'Operador';
  }

  getRolClass(role: string): string {
    return role === 'admin' ? 'badge-admin' : 'badge-operador';
  }

  getEstadoLabel(usuario: Usuario): string {
    return usuario.activo !== false ? 'Activo' : 'Inactivo';
  }

  getEstadoClass(usuario: Usuario): string {
    return usuario.activo !== false ? 'badge-activo' : 'badge-inactivo';
  }

  formatearFecha(fecha: Date | string): string {
    if (!fecha) return 'Nunca';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  nuevoUsuario(): void {
    this.router.navigate(['/usuarios/nuevo']);
  }

  editarUsuario(id: number): void {
    this.router.navigate(['/usuarios/editar', id]);
  }

  toggleEstado(usuario: Usuario): void {
    const nuevoEstado = usuario.activo === false;
    const mensaje = nuevoEstado ? 'activar' : 'desactivar';
    
    if (confirm(`¿Estás seguro de ${mensaje} a ${usuario.name}?`)) {
      this.usuariosService.toggleEstado(usuario.id, nuevoEstado).subscribe({
        next: () => {
          usuario.activo = nuevoEstado;
          this.calcularEstadisticas();
        },
        error: (error: any) => {
          console.error('Error al cambiar estado:', error);
          alert('Error al cambiar el estado del usuario');
        }
      });
    }
  }

  eliminarUsuario(usuario: Usuario): void {
    if (confirm(`¿Estás seguro de eliminar a ${usuario.name}?\n\nEsta acción no se puede deshacer.`)) {
      this.usuariosService.delete(usuario.id).subscribe({
        next: () => {
          this.loadUsuarios();
        },
        error: (error: any) => {
          console.error('Error al eliminar usuario:', error);
          alert('Error al eliminar el usuario');
        }
      });
    }
  }

  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.filtroRol = '';
    this.filtroEstado = '';
  }
}