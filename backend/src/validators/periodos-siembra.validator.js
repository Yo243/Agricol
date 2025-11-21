const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware para manejar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Errores de validación',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Validación para crear período de siembra
 */
const validateCreatePeriodo = [
  body('parcelaId')
    .notEmpty()
    .withMessage('La parcela es obligatoria')
    .isInt({ min: 1 })
    .withMessage('El ID de parcela debe ser un número válido'),

  body('cultivoId')
    .notEmpty()
    .withMessage('El cultivo es obligatorio')
    .isInt({ min: 1 })
    .withMessage('El ID de cultivo debe ser un número válido'),

  body('fechaInicio')
    .notEmpty()
    .withMessage('La fecha de inicio es obligatoria')
    .isISO8601()
    .withMessage('La fecha de inicio debe ser válida (formato ISO 8601)')
    .custom((value) => {
      const fecha = new Date(value);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      // Permitir fechas hasta 30 días en el pasado
      const hace30Dias = new Date(hoy);
      hace30Dias.setDate(hace30Dias.getDate() - 30);
      
      if (fecha < hace30Dias) {
        throw new Error('La fecha de inicio no puede ser mayor a 30 días en el pasado');
      }
      return true;
    }),

  body('fechaCosechaEsperada')
    .notEmpty()
    .withMessage('La fecha de cosecha esperada es obligatoria')
    .isISO8601()
    .withMessage('La fecha de cosecha esperada debe ser válida')
    .custom((value, { req }) => {
      const fechaInicio = new Date(req.body.fechaInicio);
      const fechaCosecha = new Date(value);
      
      if (fechaCosecha <= fechaInicio) {
        throw new Error('La fecha de cosecha debe ser posterior a la fecha de inicio');
      }

      // Validar que no sea más de 2 años en el futuro
      const dosAñosAdelante = new Date(fechaInicio);
      dosAñosAdelante.setFullYear(dosAñosAdelante.getFullYear() + 2);
      
      if (fechaCosecha > dosAñosAdelante) {
        throw new Error('La fecha de cosecha no puede ser mayor a 2 años desde la fecha de inicio');
      }

      return true;
    }),

  body('hectareasSembradas')
    .notEmpty()
    .withMessage('Las hectáreas sembradas son obligatorias')
    .isFloat({ min: 0.1, max: 10000 })
    .withMessage('Las hectáreas deben estar entre 0.1 y 10,000'),

  body('rendimientoEsperado')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El rendimiento esperado debe ser un número positivo'),

  body('observaciones')
    .optional()
    .isString()
    .withMessage('Las observaciones deben ser texto')
    .isLength({ max: 1000 })
    .withMessage('Las observaciones no pueden exceder 1000 caracteres'),

  handleValidationErrors
];

/**
 * Validación para actualizar período de siembra
 */
const validateUpdatePeriodo = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del período debe ser un número válido'),

  body('fechaCosechaEsperada')
    .optional()
    .isISO8601()
    .withMessage('La fecha de cosecha esperada debe ser válida'),

  body('hectareasSembradas')
    .optional()
    .isFloat({ min: 0.1, max: 10000 })
    .withMessage('Las hectáreas deben estar entre 0.1 y 10,000'),

  body('rendimientoEsperado')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El rendimiento esperado debe ser un número positivo'),

  body('observaciones')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Las observaciones no pueden exceder 1000 caracteres'),

  body('estado')
    .optional()
    .isIn(['En Curso', 'Finalizado', 'Cancelado'])
    .withMessage('El estado debe ser: En Curso, Finalizado o Cancelado'),

  handleValidationErrors
];

/**
 * Validación para cerrar período de siembra
 */
const validateCerrarPeriodo = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del período debe ser un número válido'),

  body('fechaCosechaReal')
    .notEmpty()
    .withMessage('La fecha de cosecha real es obligatoria')
    .isISO8601()
    .withMessage('La fecha de cosecha real debe ser válida')
    .custom((value) => {
      const fecha = new Date(value);
      const hoy = new Date();
      
      if (fecha > hoy) {
        throw new Error('La fecha de cosecha real no puede ser futura');
      }
      return true;
    }),

  body('rendimientoReal')
    .notEmpty()
    .withMessage('El rendimiento real es obligatorio')
    .isFloat({ min: 0, max: 1000 })
    .withMessage('El rendimiento real debe estar entre 0 y 1000 ton/ha'),

  body('observaciones')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Las observaciones no pueden exceder 1000 caracteres'),

  handleValidationErrors
];

/**
 * Validación para obtener período por ID
 */
const validateGetById = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del período debe ser un número válido'),

  handleValidationErrors
];

/**
 * Validación para obtener períodos por parcela
 */
const validateGetPorParcela = [
  param('parcelaId')
    .isInt({ min: 1 })
    .withMessage('El ID de parcela debe ser un número válido'),

  handleValidationErrors
];

/**
 * Validación para eliminar período
 */
const validateDelete = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del período debe ser un número válido'),

  handleValidationErrors
];

module.exports = {
  validateCreatePeriodo,
  validateUpdatePeriodo,
  validateCerrarPeriodo,
  validateGetById,
  validateGetPorParcela,
  validateDelete
};