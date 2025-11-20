// backend/src/validators/ordenes.validator.js

const { body, validationResult } = require('express-validator');

const validateOrden = [
  body('parcelaId')
    .isInt({ min: 1 })
    .withMessage('El ID de parcela debe ser un número entero positivo'),

  body('recetaId')
    .isInt({ min: 1 })
    .withMessage('El ID de receta debe ser un número entero positivo'),

  body('hectareasAplicadas')
    .isFloat({ min: 0.01 })
    .withMessage('Las hectáreas deben ser un número mayor a 0'),

  body('fechaAplicacion')
    .optional()
    .isISO8601()
    .withMessage('La fecha debe tener formato válido'),

  body('operadorId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del operador debe ser un número entero positivo'),

  body('observaciones')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Las observaciones no pueden exceder 500 caracteres'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Errores de validación',
        errors: errors.array()
      });
    }
    next();
  }
];

const validateOrdenUpdate = [
  body('hectareasAplicadas')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Las hectáreas deben ser un número mayor a 0'),

  body('fechaAplicacion')
    .optional()
    .isISO8601()
    .withMessage('La fecha debe tener formato válido'),

  body('operadorId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del operador debe ser un número entero positivo'),

  body('observaciones')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Las observaciones no pueden exceder 500 caracteres'),

  body('estado')
    .optional()
    .isIn(['pendiente', 'aplicada', 'cancelada'])
    .withMessage('Estado inválido'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Errores de validación',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validateOrden,
  validateOrdenUpdate
};