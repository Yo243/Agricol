export interface PeriodoSiembra {
  id: number;
  parcelaId: number;
  cultivoId: number;
  codigo: string;
  fechaInicio: Date;
  fechaFin?: Date;
  fechaCosechaEsperada: Date;
  fechaCosechaReal?: Date;
  hectareasSembradas: number;
  rendimientoEsperado?: number;
  rendimientoReal?: number;
  costoTotal: number;
  estado: EstadoPeriodoSiembra;
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relaciones
  parcela?: Parcela;
  cultivo?: Cultivo;
  aplicaciones?: AplicacionParcela[];
  actividades?: Actividad[];
}

export enum EstadoPeriodoSiembra {
  EN_CURSO = 'En Curso',
  FINALIZADO = 'Finalizado',
  CANCELADO = 'Cancelado'
}

export interface Parcela {
  id: number;
  codigo: string;
  nombre: string;
  superficieHa: number;
  ubicacion?: string;
  coordenadas?: string;
  tipoSuelo?: string;
  sistemaRiego?: string;
  estado: string;
  observaciones?: string;
  activo: boolean;
}

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

export interface AplicacionParcela {
  id: number;
  periodoSiembraId: number;
  parcelaId: number;
  fecha: Date;
  hectareasAplicadas: number;
  tipoAplicacion: string;
  costoTotal: number;
  responsable?: string;
  observaciones?: string;
}

export interface Actividad {
  id: number;
  periodoSiembraId: number;
  nombre: string;
  tipo: string;
  fechaProgramada: Date;
  fechaRealizada?: Date;
  estado: string;
  responsable?: string;
  costo?: number;
  observaciones?: string;
}

// DTOs para crear/actualizar

export interface CreatePeriodoSiembraDto {
  parcelaId: number;
  cultivoId: number;
  fechaInicio: string;
  fechaCosechaEsperada: string;
  hectareasSembradas: number;
  rendimientoEsperado?: number;
  observaciones?: string;
}

export interface UpdatePeriodoSiembraDto {
  hectareasSembradas?: number;
  fechaCosechaEsperada?: string;
  rendimientoEsperado?: number;
  observaciones?: string;
  estado?: EstadoPeriodoSiembra;
}

export interface CerrarPeriodoSiembraDto {
  fechaCosechaReal: string;
  rendimientoReal: number;
  observaciones?: string;
}