const Joi = require('joi');

/**
 * Validación para registro
 */
exports.registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Debe ser un correo válido',
      'any.required': 'El correo es requerido'
    }),
  
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'La contraseña debe tener mínimo 6 caracteres',
      'any.required': 'La contraseña es requerida'
    }),
  
  name: Joi.string()
    .min(2)
    .required()
    .messages({
      'string.min': 'El nombre debe tener mínimo 2 caracteres',
      'any.required': 'El nombre es requerido'
    })
});

/**
 * Validación para login
 */
exports.loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Debe ser un correo válido',
      'any.required': 'El correo es requerido'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'La contraseña es requerida'
    })
});