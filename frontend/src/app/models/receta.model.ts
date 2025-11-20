// src/app/core/models/receta.model.ts

export interface Cultivo {
  id: number;
  nombre: string;
  variedad?: string;
  descripcion?: string;
  diasCiclo?: number;
  costoPorHectarea: number;
  rendimientoEsperado?: number;
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

export interface RecetaDetalle {
  id?: number;
  recetaId?: number;
  insumoId: number;
  insumo?: InsumoInventario;
  dosisPorHectarea: number;
  unidadMedida: string;
  orden: number;
}

export interface Receta {
  id?: number;
  cultivoId: number;
  cultivo?: Cultivo;
  nombre: string;
  descripcion?: string;
  etapaCultivo?: string;
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  detalles: RecetaDetalle[];
  costoPorHectarea?: number;
  numeroInsumos?: number;
}

export interface CreateRecetaDto {
  cultivoId: number;
  nombre: string;
  descripcion?: string;
  etapaCultivo?: string;
  detalles: {
    insumoId: number;
    dosisPorHectarea: number;
    unidadMedida: string;
    orden?: number;
  }[];
}

export interface UpdateRecetaDto {
  cultivoId?: number;
  nombre?: string;
  descripcion?: string;
  etapaCultivo?: string;
  activo?: boolean;
  detalles?: {
    insumoId: number;
    dosisPorHectarea: number;
    unidadMedida: string;
    orden?: number;
  }[];
}

export interface RecetaFilters {
  cultivoId?: number;
  etapaCultivo?: string;
  activo?: boolean;
  search?: string;
}