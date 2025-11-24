const { body, param, validationResult } = require('express-validator');

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
 * Validación para crear usuario
 */
const validateCreate = [
  body('email')
    .notEmpty()
    .withMessage('El email es obligatorio')
    .isEmail()
    .withMessage('El email debe ser válido')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),

  body('name')
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .trim(),

  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('El rol debe ser "admin" o "user"'),

  handleValidationErrors
];

/**
 * Validación para actualizar usuario
 */
const validateUpdate = [
  body('email')
    .optional()
    .isEmail()
    .withMessage('El email debe ser válido')
    .normalizeEmail(),

  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .trim(),

  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('El rol debe ser "admin" o "user"'),

  handleValidationErrors
];

/**
 * Validación para cambiar estado
 */
const validateToggleEstado = [
  body('activo')
    .notEmpty()
    .withMessage('El estado activo es obligatorio')
    .isBoolean()
    .withMessage('El estado debe ser un valor booleano'),

  handleValidationErrors
];

/**
 * Validación para cambiar contraseña
 */
const validateCambiarPassword = [
  body('passwordActual')
    .notEmpty()
    .withMessage('La contraseña actual es obligatoria'),

  body('passwordNuevo')
    .notEmpty()
    .withMessage('La nueva contraseña es obligatoria')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
    .custom((value, { req }) => {
      if (value === req.body.passwordActual) {
        throw new Error('La nueva contraseña debe ser diferente a la actual');
      }
      return true;
    }),

  handleValidationErrors
];

/**
 * Validación para ID de usuario
 */
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del usuario debe ser un número válido'),

  handleValidationErrors
];

module.exports = {
  validateCreate,
  validateUpdate,
  validateToggleEstado,
  validateCambiarPassword,
  validateId
};