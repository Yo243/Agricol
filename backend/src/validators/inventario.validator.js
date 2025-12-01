const Joi = require('joi');

// 🔹 Unidades de medida válidas (códigos cortos + nombres largos)
const UNIDADES_MEDIDA_VALIDAS = [
  // Códigos cortos que manda el front
  'kg',
  'L',
  'unidades',
  'sacos',
  'cajas',

  // Nombres largos (por compatibilidad)
  'Kilogramos',
  'Litros',
  'Gramos',
  'Mililitros',
  'Toneladas',
  'Unidades',
  'Sacos',
  'Cajas',
  'Galones',
  'Metros',
  'Metros Cuadrados',
  'Hectáreas'
];

/**
 * Validación para crear item
 */
exports.createItemSchema = Joi.object({
  codigo: Joi.string().required().trim().messages({
    'string.empty': 'El código es requerido',
    'any.required': 'El código es requerido'
  }),

  nombre: Joi.string().required().trim().messages({
    'string.empty': 'El nombre es requerido',
    'any.required': 'El nombre es requerido'
  }),

  categoria: Joi.string()
    .required()
    .valid(
      'Fertilizantes',
      'Pesticidas',
      'Herbicidas',
      'Fungicidas',
      'Semillas',
      'Herramientas',
      'Maquinaria',
      'Equipos de Protección',
      'Combustibles y Lubricantes',
      'Insumos Generales',
      'Repuestos',
      'Material de Riego',
      'Envases y Embalajes'
    )
    .messages({
      'any.required': 'La categoría es requerida',
      'any.only': 'Categoría no válida'
    }),

  subcategoria: Joi.string().allow('', null),
  descripcion: Joi.string().allow('', null),

  // Stock
  stockActual: Joi.number().min(0).required().messages({
    'number.min': 'El stock actual no puede ser negativo',
    'any.required': 'El stock actual es requerido'
  }),

  stockMinimo: Joi.number().min(0).required().messages({
    'number.min': 'El stock mínimo no puede ser negativo',
    'any.required': 'El stock mínimo es requerido'
  }),

  stockMaximo: Joi.number()
    .min(Joi.ref('stockMinimo'))
    .required()
    .messages({
      'number.min': 'El stock máximo debe ser mayor o igual al stock mínimo',
      'any.required': 'El stock máximo es requerido'
    }),

  unidadMedida: Joi.string()
    .required()
    .valid(...UNIDADES_MEDIDA_VALIDAS)
    .messages({
      'any.required': 'La unidad de medida es requerida',
      'any.only': 'Unidad de medida no válida'
    }),

  // Ubicación
  ubicacion: Joi.string().required().messages({
    'any.required': 'La ubicación es requerida'
  }),
  almacen: Joi.string().allow('', null),
  seccion: Joi.string().allow('', null),

  // Precios
  costoUnitario: Joi.number().min(0).required().messages({
    'number.min': 'El costo unitario no puede ser negativo',
    'any.required': 'El costo unitario es requerido'
  }),
  precioVenta: Joi.number().min(0).allow(null),

  // Proveedor
  proveedor: Joi.string().allow('', null),
  numeroLote: Joi.string().allow('', null),

  // Fechas
  fechaAdquisicion: Joi.date().allow(null),
  fechaVencimiento: Joi.date().allow(null),

  // Estado
  estado: Joi.string()
    .valid(
      'Disponible',
      'Stock Bajo',
      'Stock Crítico',
      'Por Vencer',
      'Vencido',
      'Agotado',
      'En Tránsito',
      'Reservado'
    )
    .default('Disponible'),

  activo: Joi.boolean().default(true),

  // Características
  composicion: Joi.string().allow('', null),
  concentracion: Joi.string().allow('', null),
  marca: Joi.string().allow('', null),
  presentacion: Joi.string().allow('', null),

  // Auditoría
  usuarioRegistro: Joi.string().allow('', null),
  observaciones: Joi.string().allow('', null)
});

/**
 * Validación para actualizar item
 */
exports.updateItemSchema = Joi.object({
  codigo: Joi.string().trim(),
  nombre: Joi.string().trim(),

  categoria: Joi.string().valid(
    'Fertilizantes',
    'Pesticidas',
    'Herbicidas',
    'Fungicidas',
    'Semillas',
    'Herramientas',
    'Maquinaria',
    'Equipos de Protección',
    'Combustibles y Lubricantes',
    'Insumos Generales',
    'Repuestos',
    'Material de Riego',
    'Envases y Embalajes'
  ),

  subcategoria: Joi.string().allow('', null),
  descripcion: Joi.string().allow('', null),

  // numéricos opcionales
  stockActual: Joi.number().min(0).allow(null),
  stockMinimo: Joi.number().min(0).allow(null),
  stockMaximo: Joi.number().min(0).allow(null),

  unidadMedida: Joi.string().valid(...UNIDADES_MEDIDA_VALIDAS),

  ubicacion: Joi.string(),

  almacen: Joi.string().allow('', null),
  seccion: Joi.string().allow('', null),

  costoUnitario: Joi.number().min(0).allow(null),
  precioVenta: Joi.number().min(0).allow(null),

  proveedor: Joi.string().allow('', null),
  numeroLote: Joi.string().allow('', null),

  // fechas: permitimos null y ''
  fechaAdquisicion: Joi.date().allow(null, ''),
  fechaVencimiento: Joi.date().allow(null, ''),

  estado: Joi.string().valid(
    'Disponible',
    'Stock Bajo',
    'Stock Crítico',
    'Por Vencer',
    'Vencido',
    'Agotado',
    'En Tránsito',
    'Reservado'
  ),

  activo: Joi.boolean(),

  composicion: Joi.string().allow('', null),
  concentracion: Joi.string().allow('', null),
  marca: Joi.string().allow('', null),
  presentacion: Joi.string().allow('', null),
  observaciones: Joi.string().allow('', null)
}).min(1);

/**
 * Validación para registrar movimiento
 */
exports.registrarMovimientoSchema = Joi.object({
  itemId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'any.required': 'El ID del item es requerido',
      'number.positive': 'El ID del item debe ser positivo'
    }),

  tipo: Joi.string()
    .required()
    .valid('Entrada', 'Salida', 'Ajuste', 'Devolución', 'Merma', 'Transferencia')
    .messages({
      'any.required': 'El tipo de movimiento es requerido',
      'any.only': 'Tipo de movimiento no válido'
    }),

  cantidad: Joi.number()
    .positive()
    .required()
    .messages({
      'any.required': 'La cantidad es requerida',
      'number.positive': 'La cantidad debe ser positiva'
    }),

  costoUnitario: Joi.number().min(0).allow(null),

  fecha: Joi.date()
    .required()
    .messages({
      'any.required': 'La fecha es requerida'
    }),

  // usuario opcional; si quieres puedes sacarlo de req.user en el controller
  usuario: Joi.string().allow('', null),

  razon: Joi.string()
    .required()
    .messages({
      'any.required': 'La razón del movimiento es requerida'
    }),

  referencia: Joi.string().allow('', null),
  destino: Joi.string().allow('', null),
  observaciones: Joi.string().allow('', null)
});
