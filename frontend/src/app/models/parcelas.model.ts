// ==========================================
// MODELOS DE PARCELAS
// ==========================================

export interface Parcela {
  id: number;
  codigo: string;
  nombre: string;
  superficieHa: number;
  ubicacion?: string;
  coordenadas?: string;
  tipoSuelo?: string;
  sistemaRiego?: string;
  estado: EstadoParcela;
  observaciones?: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  periodosSiembra?: PeriodoSiembra[];
  aplicaciones?: AplicacionParcela[];
  _count?: {
    periodosSiembra: number;
    aplicaciones: number;
  };
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
  createdAt: Date;
  updatedAt: Date;
}

export interface PeriodoSiembra {
  id: number;
  parcelaId: number;
  cultivoId: number;
  codigo: string;
  fechaInicio: Date;
  fechaFin?: Date;
  fechaCosechaEsperada?: Date;
  fechaCosechaReal?: Date;
  hectareasSembradas: number;
  rendimientoEsperado?: number;
  rendimientoReal?: number;
  costoTotal: number;
  estado: EstadoPeriodo;
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
  parcela?: Parcela;
  cultivo?: Cultivo;
  aplicaciones?: AplicacionParcela[];
  actividades?: Actividad[];
  _count?: {
    aplicaciones: number;
    actividades: number;
  };
}

export interface AplicacionParcela {
  id: number;
  periodoSiembraId: number;
  parcelaId: number;
  fecha: Date;
  hectareasAplicadas: number;
  tipoAplicacion: TipoAplicacion;
  costoTotal: number;
  responsable?: string;
  observaciones?: string;
  createdAt: Date;
  periodoSiembra?: PeriodoSiembra;
  parcela?: Parcela;
  insumos?: AplicacionInsumo[];
}

export interface AplicacionInsumo {
  id: number;
  aplicacionId: number;
  insumoId: number;
  cantidad: number;
  unidadMedida: string;
  costoUnitario: number;
  costoTotal: number;
  dosisPorHectarea: number;
  createdAt: Date;
  insumo?: {
    id: number;
    nombre: string;
    codigo?: string;
    categoria: string;
  };
}

export interface Receta {
  id: number;
  cultivoId: number;
  nombre: string;
  descripcion?: string;
  etapaCultivo?: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  cultivo?: Cultivo;
  detalles?: RecetaDetalle[];
}

export interface RecetaDetalle {
  id: number;
  recetaId: number;
  insumoId: number;
  dosisPorHectarea: number;
  unidadMedida: string;
  orden: number;
  insumo?: {
    id: number;
    nombre: string;
    codigo?: string;
  };
}

export interface Actividad {
  id: number;
  periodoSiembraId: number;
  nombre: string;
  tipo: TipoActividad;
  fechaProgramada: Date;
  fechaRealizada?: Date;
  estado: EstadoActividad;
  responsable?: string;
  costo?: number;
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// TIPOS Y ENUMS
// ==========================================

export type EstadoParcela = 'Activa' | 'Inactiva' | 'En Preparación' | 'En Descanso';

export type EstadoPeriodo = 'En Curso' | 'Finalizado' | 'Cancelado';

export type TipoAplicacion = 
  | 'Fertilización'
  | 'Fumigación'
  | 'Control de Plagas'
  | 'Control de Malezas'
  | 'Riego'
  | 'Otros';

export type TipoActividad = 
  | 'Riego'
  | 'Fertilización'
  | 'Fumigación'
  | 'Cosecha'
  | 'Control de Malezas'
  | 'Otros';

export type EstadoActividad = 'Pendiente' | 'En Proceso' | 'Completada' | 'Cancelada';

// ==========================================
// DTOs PARA FORMULARIOS
// ==========================================

export interface CreateParcelaDto {
  codigo?: string;
  nombre: string;
  superficieHa: number;
  ubicacion?: string;
  coordenadas?: string;
  tipoSuelo?: string;
  sistemaRiego?: string;
  estado?: EstadoParcela;
  observaciones?: string;
}

export interface CreatePeriodoSiembraDto {
  parcelaId: number;
  cultivoId: number;
  fechaInicio: Date | string;
  fechaCosechaEsperada?: Date | string;
  hectareasSembradas: number;
  rendimientoEsperado?: number;
  observaciones?: string;
}

export interface CreateAplicacionDto {
  periodoSiembraId: number;
  parcelaId: number;
  fecha: Date | string;
  hectareasAplicadas: number;
  tipoAplicacion: TipoAplicacion;
  insumos: {
    insumoId: number;
    cantidad: number;
    dosisPorHectarea: number;
  }[];
  responsable?: string;
  observaciones?: string;
}

export interface FinalizarPeriodoDto {
  fechaCosechaReal: Date | string;
  rendimientoReal: number;
  observaciones?: string;
}

// ==========================================
// INTERFACES PARA REPORTES
// ==========================================

export interface EstadisticasParcelas {
  totalParcelas: number;
  superficieTotal: number;
  parcelasActivas: number;
  periodosSiembraActivos: number;
  costoTotalAplicaciones: number;
  porEstado: { [key: string]: number };
}

export interface ReporteProduccion {
  parcela: string;
  cultivo: string;
  hectareas: number;
  rendimientoEsperado?: number;
  rendimientoReal?: number;
  variacion?: number;
  costoTotal: number;
  costoPorHectarea: number;
  fechaInicio: Date;
  fechaCosecha?: Date;
  numeroAplicaciones: number;
}

export interface TrazabilidadParcela {
  parcela: {
    codigo: string;
    nombre: string;
    superficie: number;
    ubicacion?: string;
  };
  trazabilidad: {
    periodo: {
      codigo: string;
      cultivo: string;
      fechaInicio: Date;
      fechaFin?: Date;
      estado: string;
      hectareas: number;
      costoTotal: number;
      rendimiento?: number;
    };
    eventos: EventoTrazabilidad[];
  }[];
}

export interface EventoTrazabilidad {
  fecha: Date;
  tipo: 'Aplicación' | 'Actividad';
  tipoAplicacion?: string;
  tipoActividad?: string;
  nombre?: string;
  hectareas?: number;
  costo?: number;
  estado?: string;
  insumos?: {
    nombre: string;
    cantidad: number;
    unidad: string;
    dosis: number;
  }[];
  responsable?: string;
}

// ==========================================
// CONSTANTES
// ==========================================

export const ESTADOS_PARCELA: EstadoParcela[] = [
  'Activa',
  'Inactiva',
  'En Preparación',
  'En Descanso'
];

export const TIPOS_APLICACION: TipoAplicacion[] = [
  'Fertilización',
  'Fumigación',
  'Control de Plagas',
  'Control de Malezas',
  'Riego',
  'Otros'
];

export const TIPOS_ACTIVIDAD: TipoActividad[] = [
  'Riego',
  'Fertilización',
  'Fumigación',
  'Cosecha',
  'Control de Malezas',
  'Otros'
];

export const ESTADOS_ACTIVIDAD: EstadoActividad[] = [
  'Pendiente',
  'En Proceso',
  'Completada',
  'Cancelada'
];

// ==========================================
// FUNCIONES HELPER
// ==========================================

export function getEstadoParcelaColor(estado: EstadoParcela): string {
  const colores: { [key in EstadoParcela]: string } = {
    'Activa': 'bg-green-100 text-green-800',
    'Inactiva': 'bg-gray-100 text-gray-800',
    'En Preparación': 'bg-blue-100 text-blue-800',
    'En Descanso': 'bg-yellow-100 text-yellow-800'
  };
  return colores[estado] || 'bg-gray-100 text-gray-800';
}

export function getEstadoPeriodoColor(estado: EstadoPeriodo): string {
  const colores: { [key in EstadoPeriodo]: string } = {
    'En Curso': 'bg-blue-100 text-blue-800',
    'Finalizado': 'bg-green-100 text-green-800',
    'Cancelado': 'bg-red-100 text-red-800'
  };
  return colores[estado] || 'bg-gray-100 text-gray-800';
}

export function getTipoAplicacionIcon(tipo: TipoAplicacion): string {
  const iconos: { [key in TipoAplicacion]: string } = {
    'Fertilización': '🌱',
    'Fumigación': '💨',
    'Control de Plagas': '🦟',
    'Control de Malezas': '🌿',
    'Riego': '💧',
    'Otros': '📋'
  };
  return iconos[tipo] || '📋';
}

export function formatearHectareas(hectareas: number): string {
  return `${hectareas.toFixed(2)} ha`;
}

export function formatearCosto(costo: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(costo);
}