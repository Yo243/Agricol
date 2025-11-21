// Modelo principal del Dashboard
export interface DashboardData {
  resumenGeneral: ResumenGeneral;
  consumoPorCultivo: ConsumoPorCultivo[];
  costosPorMes: CostosPorMes[];
  alertas: Alerta[];
  periodosActivos: PeriodoSiembraResumen[];
}

export interface ResumenGeneral {
  totalParcelas: number;
  hectareasTotales: number;
  cultivosActivos: number;
  costoTotalAcumulado: number;
}

export interface ConsumoPorCultivo {
  cultivo: string;
  cantidad: number;
  unidad: string;
  costo: number;
}

export interface CostosPorMes {
  mes: string;
  costo: number;
  aplicaciones: number;
}

export interface Alerta {
  id: number;
  tipo: 'stock' | 'vencimiento' | 'aplicacion' | 'cosecha';
  titulo: string;
  mensaje: string;
  prioridad: 'alta' | 'media' | 'baja';
  fecha: Date;
  itemId?: number;
  leida: boolean;
}

export interface PeriodoSiembraResumen {
  id: number;
  codigo: string;
  cultivo: string;
  parcela: string;
  hectareas: number;
  fechaInicio: Date;
  fechaCosechaEsperada: Date;
  estado: string;
  progreso: number;
  costoTotal: number;
}

// Reportes específicos

export interface ReporteConsumo {
  titulo: string;
  periodo: string;
  items: ItemConsumo[];
  totalCantidad: number;
  totalCosto: number;
}

export interface ItemConsumo {
  nombre: string;
  categoria: string;
  cantidad: number;
  unidad: string;
  costoUnitario: number;
  costoTotal: number;
  cultivo?: string;
  parcela?: string;
}

export interface ReporteCostos {
  titulo: string;
  periodo: string;
  costoTotal: number;
  costoPorHectarea: number;
  desglosePorCategoria: DesgloseCosto[];
  desglosePorCultivo: DesgloseCosto[];
  tendencia: TendenciaCosto[];
}

export interface DesgloseCosto {
  nombre: string;
  costo: number;
  porcentaje: number;
}

export interface TendenciaCosto {
  periodo: string;
  costo: number;
  variacion: number;
}

export interface ReporteProduccion {
  titulo: string;
  periodo: string;
  rendimientos: RendimientoParcela[];
  promedioRendimiento: number;
  totalProduccion: number;
}

export interface RendimientoParcela {
  parcela: string;
  cultivo: string;
  hectareas: number;
  rendimientoEsperado: number;
  rendimientoReal?: number;
  diferencia?: number;
  porcentajeCumplimiento?: number;
}

export interface Trazabilidad {
  parcela: string;
  historial: EventoTrazabilidad[];
  resumen: ResumenTrazabilidad;
}

export interface EventoTrazabilidad {
  fecha: Date;
  tipo: 'siembra' | 'aplicacion' | 'cosecha' | 'actividad';
  descripcion: string;
  detalles: any;
  responsable?: string;
  costo?: number;
}

export interface ResumenTrazabilidad {
  totalAplicaciones: number;
  totalInsumos: number;
  costoTotal: number;
  rendimientoPromedio: number;
  periodos: number;
}

// Filtros para reportes

export interface FiltrosReporte {
  fechaInicio?: string;
  fechaFin?: string;
  parcelaId?: number;
  cultivoId?: number;
  tipo?: string;
}

export interface OpcionesExportacion {
  tipo: 'pdf' | 'excel';
  incluirGraficas: boolean;
  orientacion?: 'portrait' | 'landscape';
}