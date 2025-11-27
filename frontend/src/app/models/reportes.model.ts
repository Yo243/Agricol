// ===============================
// MODELOS DE REPORTES AGRICOL
// ===============================

// ===============================
// DASHBOARD
// ===============================
export interface DashboardResponse {
  resumenGeneral: {
    totalParcelas: number;
    hectareasTotales: number;
    cultivosActivos: number;
    costoTotalAcumulado: number;
  };

  consumoPorCultivo: ConsumoCultivoItem[];
  costosPorMes: CostoMesItem[];
  periodosActivos: PeriodoActivoItem[];
  alertas: AlertaItem[];
}

// ===============================
// CONSUMO POR CULTIVO
// ===============================
export interface ConsumoCultivoItem {
  cultivo: string;
  cantidad: number;
  unidad: string;
  costo: number;
}

// ===============================
// COSTOS POR MES
// ===============================
export interface CostoMesItem {
  mes: string;
  costo: number;
  aplicaciones: number;
}

// ===============================
// PERÍODOS ACTIVOS
// ===============================
export interface PeriodoActivoItem {
  id: number;
  codigo: string;
  cultivo: string;
  parcela: string;
  hectareas: number;
  fechaInicio: string;
  fechaCosechaEsperada: string;
  estado: string;
  progreso: number;
  costoTotal: number;
}

// ===============================
// ALERTAS DE INVENTARIO
// ===============================
export interface AlertaItem {
  id: number;
  tipo: string;
  prioridad: string;
  mensaje: string;
  fecha: string;
}

// ===============================
// CONSUMO POR PARCELA
// ===============================
export interface ConsumoParcelaItem {
  id: number;
  parcela: string;
  codigoParcela: string;
  fecha: string;
  hectareasAplicadas: number;
  tipoAplicacion: string;
  costoTotal: number;
  insumos: ConsumoInsumoItem[];
}

export interface ConsumoInsumoItem {
  nombre: string;
  cantidad: number;
  unidad: string;
}

// ===============================
// COSTOS POR FECHA
// ===============================
export interface CostosResponseItem {
  periodo: string;
  costo: number;
  aplicaciones: number;
}

// ===============================
// COSTOS POR HECTÁREA
// ===============================
export interface CostosHectareaResponse {
  periodoId: number;
  cultivo: string;
  parcela: string;
  hectareas: number;
  costoTotal: number;
  costoPorHectarea: number;
}

// ===============================
// TRAZABILIDAD DE PARCELA
// ===============================
export interface TrazabilidadResponse {
  parcela: {
    id: number;
    nombre: string;
    codigo: string;
    superficie: number;
  };
  historial: TrazabilidadPeriodoItem[];
}

export interface TrazabilidadPeriodoItem {
  id: number;
  codigo: string;
  cultivo: string;
  fechaInicio: string;
  fechaFin: string | null;
  estado: string;
  hectareas: number;
  rendimiento: number | null;
  costoTotal: number;
  aplicaciones: number;
  detalleAplicaciones: DetalleAplicacionItem[];
}

export interface DetalleAplicacionItem {
  fecha: string;
  tipo: string;
  hectareas: number;
  costo: number;
  insumos: DetalleInsumoItem[];
}

export interface DetalleInsumoItem {
  nombre: string;
  cantidad: number;
  unidad: string;
}

// ===============================
// ALERTAS (LISTADO COMPLETO)
// ===============================
export interface AlertaInventario {
  id: number;
  tipo: string;
  prioridad: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  insumo: string;
  unidad: string;
}