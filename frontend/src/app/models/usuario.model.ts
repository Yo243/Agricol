export interface Usuario {
  id: number;
  email: string;
  password?: string; // No se devuelve en las respuestas
  name: string;
  role: RolUsuario;
  activo?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum RolUsuario {
  ADMIN = 'admin',
  USER = 'user'
}

export interface CreateUsuarioDto {
  email: string;
  password: string;
  name: string;
  role: RolUsuario;
}

export interface UpdateUsuarioDto {
  email?: string;
  name?: string;
  role?: RolUsuario;
  activo?: boolean;
}

export interface CambiarPasswordDto {
  passwordActual: string;
  passwordNuevo: string;
}

export interface EstadisticasUsuarios {
  totalUsuarios: number;
  totalAdministradores: number;
  totalOperadores: number;
  usuariosActivos: number;
  usuariosInactivos: number;
}

export interface UsuarioSession {
  id: number;
  email: string;
  name: string;
  role: RolUsuario;
  token?: string;
}