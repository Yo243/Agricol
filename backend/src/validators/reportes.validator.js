const { param, query, validationResult } = require('express-validator');

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
 * Validación para dashboard
 */
const validateDashboard = [
  query('fechaInicio')
    .optional()
    .isISO8601()
    .withMessage('La fecha de inicio debe ser válida (formato ISO 8601)')
    .custom((value, { req }) => {
      if (req.query.fechaFin) {
        const inicio = new Date(value);
        const fin = new Date(req.query.fechaFin);
        if (inicio > fin) {
          throw new Error('La fecha de inicio debe ser anterior a la fecha fin');
        }
      }
      return true;
    }),

  query('fechaFin')
    .optional()
    .isISO8601()
    .withMessage('La fecha fin debe ser válida (formato ISO 8601)')
    .custom((value) => {
      const fecha = new Date(value);
      const hoy = new Date();
      if (fecha > hoy) {
        throw new Error('La fecha fin no puede ser futura');
      }
      return true;
    }),

  handleValidationErrors
];

/**
 * Validación para consumo por cultivo
 */
const validateConsumoCultivo = [
  query('fechaInicio')
    .optional()
    .isISO8601()
    .withMessage('La fecha de inicio debe ser válida'),

  query('fechaFin')
    .optional()
    .isISO8601()
    .withMessage('La fecha fin debe ser válida')
    .custom((value, { req }) => {
      if (req.query.fechaInicio) {
        const inicio = new Date(req.query.fechaInicio);
        const fin = new Date(value);
        if (fin < inicio) {
          throw new Error('La fecha fin debe ser posterior a la fecha de inicio');
        }
      }
      return true;
    }),

  handleValidationErrors
];

/**
 * Validación para consumo por parcela
 */
const validateConsumoParcela = [
  query('parcelaId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID de parcela debe ser un número válido'),

  handleValidationErrors
];

/**
 * Validación para reporte de costos
 */
const validateCostos = [
  query('fechaInicio')
    .notEmpty()
    .withMessage('La fecha de inicio es obligatoria')
    .isISO8601()
    .withMessage('La fecha de inicio debe ser válida'),

  query('fechaFin')
    .notEmpty()
    .withMessage('La fecha fin es obligatoria')
    .isISO8601()
    .withMessage('La fecha fin debe ser válida')
    .custom((value, { req }) => {
      const inicio = new Date(req.query.fechaInicio);
      const fin = new Date(value);
      
      if (fin < inicio) {
        throw new Error('La fecha fin debe ser posterior a la fecha de inicio');
      }

      // Validar que el rango no sea mayor a 2 años
      const dosAños = 2 * 365 * 24 * 60 * 60 * 1000;
      if (fin - inicio > dosAños) {
        throw new Error('El rango de fechas no puede ser mayor a 2 años');
      }

      return true;
    }),

  query('agruparPor')
    .optional()
    .isIn(['dia', 'mes', 'año'])
    .withMessage('El parámetro agruparPor debe ser: dia, mes o año'),

  handleValidationErrors
];

/**
 * Validación para trazabilidad de parcela
 */
const validateTrazabilidadParcela = [
  param('parcelaId')
    .isInt({ min: 1 })
    .withMessage('El ID de parcela debe ser un número válido'),

  handleValidationErrors
];

/**
 * Validación para reporte de producción
 */
const validateProduccion = [
  query('fechaInicio')
    .optional()
    .isISO8601()
    .withMessage('La fecha de inicio debe ser válida'),

  query('fechaFin')
    .optional()
    .isISO8601()
    .withMessage('La fecha fin debe ser válida'),

  query('cultivoId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID de cultivo debe ser un número válido'),

  query('parcelaId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID de parcela debe ser un número válido'),

  handleValidationErrors
];

/**
 * Validación genérica de rango de fechas
 */
const validateDateRange = [
  query('fechaInicio')
    .optional()
    .isISO8601()
    .withMessage('La fecha de inicio debe ser válida (formato: YYYY-MM-DD)'),

  query('fechaFin')
    .optional()
    .isISO8601()
    .withMessage('La fecha fin debe ser válida (formato: YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (req.query.fechaInicio) {
        const inicio = new Date(req.query.fechaInicio);
        const fin = new Date(value);
        
        if (fin < inicio) {
          throw new Error('La fecha fin debe ser posterior o igual a la fecha de inicio');
        }

        // Validar rango máximo de 5 años
        const cincoAños = 5 * 365 * 24 * 60 * 60 * 1000;
        if (fin - inicio > cincoAños) {
          throw new Error('El rango de fechas no puede ser mayor a 5 años');
        }
      }
      return true;
    }),

  handleValidationErrors
];

module.exports = {
  validateDashboard,
  validateConsumoCultivo,
  validateConsumoParcela,
  validateCostos,
  validateTrazabilidadParcela,
  validateProduccion,
  validateDateRange
};