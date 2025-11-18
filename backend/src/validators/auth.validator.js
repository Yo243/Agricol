const Joi = require('joi');

/**
 * Esquema de validación para Login
 */
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'El correo electrónico no es válido',
      'any.required': 'El correo electrónico es requerido',
      'string.empty': 'El correo electrónico no puede estar vacío'
    }),
  
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'any.required': 'La contraseña es requerida',
      'string.empty': 'La contraseña no puede estar vacía'
    })
});

/**
 * Esquema de validación para Registro
 */
const registerSchema = Joi.object({
  nombre: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede tener más de 100 caracteres',
      'any.required': 'El nombre es requerido',
      'string.empty': 'El nombre no puede estar vacío'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'El correo electrónico no es válido',
      'any.required': 'El correo electrónico es requerido',
      'string.empty': 'El correo electrónico no puede estar vacío'
    }),
  
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'any.required': 'La contraseña es requerida',
      'string.empty': 'La contraseña no puede estar vacía'
    }),
  
  rol: Joi.string()
    .valid('ADMIN', 'USER')
    .default('USER')
    .messages({
      'any.only': 'El rol debe ser ADMIN o USER'
    })
});

module.exports = {
  loginSchema,
  registerSchema
};