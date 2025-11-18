/**
 * Middleware de validación con Joi
 * Valida el body, params o query de las peticiones HTTP
 */

const validate = (schema) => {
  return (req, res, next) => {
    // Validar el body de la petición
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Devuelve todos los errores, no solo el primero
      stripUnknown: true // Elimina campos no definidos en el schema
    });

    if (error) {
      // Formatear errores de validación
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors
      });
    }

    // Reemplazar req.body con el valor validado y sanitizado
    req.body = value;
    next();
  };
};

module.exports = validate;