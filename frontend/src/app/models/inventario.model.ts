export interface InventarioItem {
  id: number;
  codigo: string;
  nombre: string;
  categoria: CategoriaInventario;
  subcategoria?: string;
  descripcion?: string;
  
  // Stock
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number;
  unidadMedida: UnidadMedida;
  
  // Ubicación
  ubicacion: string;
  almacen?: string;
  seccion?: string;
  
  // Precios y costos
  costoUnitario: number;
  precioVenta?: number;
  valorTotal: number;
  
  // Proveedores
  proveedor?: string;
  numeroLote?: string;
  
  // Fechas
  fechaAdquisicion: Date;
  fechaVencimiento?: Date;
  diasParaVencer?: number;
  
  // Estado
  estado: EstadoInventario;
  activo: boolean;
  
  // Características específicas
  composicion?: string; // Para fertilizantes (NPK)
  concentracion?: string; // Para químicos
  marca?: string;
  presentacion?: string; // Saco, bidón, caja, etc.
  
  // Auditoría
  ultimoMovimiento?: Date;
  usuarioRegistro?: string;
  observaciones?: string;
}

export enum CategoriaInventario {
  FERTILIZANTES = 'Fertilizantes',
  PESTICIDAS = 'Pesticidas',
  HERBICIDAS = 'Herbicidas',
  FUNGICIDAS = 'Fungicidas',
  SEMILLAS = 'Semillas',
  HERRAMIENTAS = 'Herramientas',
  MAQUINARIA = 'Maquinaria',
  EQUIPOS = 'Equipos de Protección',
  COMBUSTIBLES = 'Combustibles y Lubricantes',
  INSUMOS = 'Insumos Generales',
  REPUESTOS = 'Repuestos',
  MATERIAL_RIEGO = 'Material de Riego',
  ENVASES = 'Envases y Embalajes'
}

export enum UnidadMedida {
  KG = 'Kilogramos',
  L = 'Litros',
  G = 'Gramos',
  ML = 'Mililitros',
  TON = 'Toneladas',
  UNIDAD = 'Unidades',
  SACO = 'Sacos',
  CAJA = 'Cajas',
  GALON = 'Galones',
  M = 'Metros',
  M2 = 'Metros Cuadrados',
  HA = 'Hectáreas'
}

export enum EstadoInventario {
  DISPONIBLE = 'Disponible',
  BAJO = 'Stock Bajo',
  CRITICO = 'Stock Crítico',
  POR_VENCER = 'Por Vencer',
  VENCIDO = 'Vencido',
  AGOTADO = 'Agotado',
  EN_TRANSITO = 'En Tránsito',
  RESERVADO = 'Reservado'
}

export interface MovimientoInventario {
  id: number;
  itemId: number;
  tipo: TipoMovimiento;
  cantidad: number;
  unidadMedida: UnidadMedida;
  costoUnitario?: number;
  costoTotal?: number;
  fecha: Date;
  usuario: string;
  razon: string;
  referencia?: string; // Número de orden, factura, etc.
  destino?: string;
  observaciones?: string;
}

export enum TipoMovimiento {
  ENTRADA = 'Entrada',
  SALIDA = 'Salida',
  AJUSTE = 'Ajuste',
  DEVOLUCION = 'Devolución',
  MERMA = 'Merma',
  TRANSFERENCIA = 'Transferencia'
}

export interface AlertaInventario {
  id: number;
  itemId: number;
  itemNombre: string;
  tipoAlerta: TipoAlerta;
  mensaje: string;
  prioridad: 'alta' | 'media' | 'baja';
  fecha: Date;
  leida: boolean;
}

export enum TipoAlerta {
  STOCK_BAJO = 'Stock Bajo',
  STOCK_CRITICO = 'Stock Crítico',
  PROXIMO_VENCER = 'Próximo a Vencer',
  VENCIDO = 'Producto Vencido',
  STOCK_AGOTADO = 'Stock Agotado'
}