const Joi = require('joi');

exports.validateParcela = Joi.object({
  codigo: Joi.string().optional(),
  nombre: Joi.string().required(),
  superficieHa: Joi.number().min(0.01).required(),
  ubicacion: Joi.string().allow('', null).optional(),
  coordenadas: Joi.string().allow('', null).optional(),
  tipoSuelo: Joi.string().allow('', null).optional(),
  sistemaRiego: Joi.string().allow('', null).optional(),
  estado: Joi.string().valid('Activa', 'Inactiva', 'En Preparación', 'En Descanso').default('Activa'),
  observaciones: Joi.string().allow('', null).optional(),
  activo: Joi.boolean().default(true)
});

exports.validatePeriodoSiembra = Joi.object({
  parcelaId: Joi.number().required(),
  cultivoId: Joi.number().required(),
  fechaInicio: Joi.date().required(),
  fechaFin: Joi.date().allow(null).optional(),
  fechaCosechaEsperada: Joi.date().allow(null).optional(),
  hectareasSembradas: Joi.number().min(0.01).required(),
  rendimientoEsperado: Joi.number().min(0).allow(null).optional(),
  observaciones: Joi.string().allow('', null).optional()
});

exports.validateAplicacion = Joi.object({
  periodoSiembraId: Joi.number().required(),
  parcelaId: Joi.number().required(),
  fecha: Joi.date().required(),
  hectareasAplicadas: Joi.number().min(0.01).required(),
  tipoAplicacion: Joi.string().valid(
    'Fertilización',
    'Fumigación',
    'Control de Plagas',
    'Control de Malezas',
    'Riego',
    'Otros'
  ).required(),
  insumos: Joi.array().items(
    Joi.object({
      insumoId: Joi.number().required(),
      cantidad: Joi.number().min(0.01).required(),
      dosisPorHectarea: Joi.number().min(0).required()
    })
  ).min(1).required(),
  responsable: Joi.string().allow('', null).optional(),
  observaciones: Joi.string().allow('', null).optional()
});

exports.validateFinalizarPeriodo = Joi.object({
  fechaCosechaReal: Joi.date().required(),
  rendimientoReal: Joi.number().min(0).required(),
  observaciones: Joi.string().allow('', null).optional()
});