// src/app/core/models/orden-aplicacion.model.ts

export interface Parcela {
  id: number;
  nombre: string;
  superficie: number; // en hectáreas
  ubicacion?: string;
  cultivo?: string;
  activo: boolean;
}

export interface InsumoInventario {
  id: number;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  costoUnitario: number;
  activo: boolean;
}

export interface Receta {
  id: number;
  cultivoId: number;
  nombre: string;
  descripcion?: string;
  etapaCultivo?: string;
  activo: boolean;
  detalles: RecetaDetalle[];
  costoPorHectarea?: number;
}

export interface RecetaDetalle {
  id?: number;
  recetaId?: number;
  insumoId: number;
  insumo?: InsumoInventario;
  dosisPorHectarea: number;
  unidadMedida: string;
  orden: number;
}

export interface OrdenDetalle {
  id?: number;
  ordenId?: number;
  insumoId: number;
  insumo?: InsumoInventario;
  cantidadCalculada: number; // Calculado automáticamente según receta
  unidadMedida: string;
  costoUnitario: number;
  costoTotal: number;
}

export interface OrdenAplicacion {
  id?: number;
  parcelaId: number;
  parcela?: Parcela;
  recetaId: number;
  receta?: Receta;
  hectareasAplicadas: number;
  fechaCreacion?: Date;
  fechaAplicacion?: Date;
  operadorId?: number;
  operador?: string;
  estado: 'pendiente' | 'aplicada' | 'cancelada';
  observaciones?: string;
  detalles: OrdenDetalle[];
  costoTotal?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateOrdenDto {
  parcelaId: number;
  recetaId: number;
  hectareasAplicadas: number;
  fechaAplicacion?: Date;
  operadorId?: number;
  observaciones?: string;
}

export interface UpdateOrdenDto {
  hectareasAplicadas?: number;
  fechaAplicacion?: Date;
  operadorId?: number;
  observaciones?: string;
  estado?: 'pendiente' | 'aplicada' | 'cancelada';
}

export interface OrdenFilters {
  parcelaId?: number;
  recetaId?: number;
  estado?: 'pendiente' | 'aplicada' | 'cancelada';
  fechaDesde?: Date;
  fechaHasta?: Date;
  search?: string;
}

export interface ValidacionStock {
  esValido: boolean;
  errores: StockError[];
}

export interface StockError {
  insumoId: number;
  insumoNombre: string;
  cantidadRequerida: number;
  stockDisponible: number;
  faltante: number;
}