const validateCreateReceta = (data) => {
  const errors = [];

  if (!data.cultivoId) {
    errors.push('El ID del cultivo es requerido');
  } else if (isNaN(parseInt(data.cultivoId))) {
    errors.push('El ID del cultivo debe ser un número válido');
  }

  if (!data.nombre || typeof data.nombre !== 'string' || data.nombre.trim() === '') {
    errors.push('El nombre es requerido');
  }

  if (!data.detalles || !Array.isArray(data.detalles) || data.detalles.length === 0) {
    errors.push('Debe incluir al menos un insumo en la receta');
  } else {
    data.detalles.forEach((detalle, index) => {
      if (!detalle.insumoId) {
        errors.push(`Detalle ${index + 1}: insumoId es requerido`);
      } else if (isNaN(parseInt(detalle.insumoId))) {
        errors.push(`Detalle ${index + 1}: insumoId debe ser un número válido`);
      }

      if (!detalle.dosisPorHectarea || detalle.dosisPorHectarea <= 0) {
        errors.push(`Detalle ${index + 1}: dosisPorHectarea debe ser mayor a 0`);
      }

      if (!detalle.unidadMedida || typeof detalle.unidadMedida !== 'string') {
        errors.push(`Detalle ${index + 1}: unidadMedida es requerida`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateUpdateReceta = (data) => {
  const errors = [];

  if (data.cultivoId !== undefined && isNaN(parseInt(data.cultivoId))) {
    errors.push('El ID del cultivo debe ser un número válido');
  }

  if (data.nombre !== undefined && (typeof data.nombre !== 'string' || data.nombre.trim() === '')) {
    errors.push('El nombre debe ser una cadena válida');
  }

  if (data.detalles !== undefined) {
    if (!Array.isArray(data.detalles) || data.detalles.length === 0) {
      errors.push('Los detalles deben ser un array con al menos un elemento');
    } else {
      data.detalles.forEach((detalle, index) => {
        if (!detalle.insumoId) {
          errors.push(`Detalle ${index + 1}: insumoId es requerido`);
        } else if (isNaN(parseInt(detalle.insumoId))) {
          errors.push(`Detalle ${index + 1}: insumoId debe ser un número válido`);
        }

        if (!detalle.dosisPorHectarea || detalle.dosisPorHectarea <= 0) {
          errors.push(`Detalle ${index + 1}: dosisPorHectarea debe ser mayor a 0`);
        }

        if (!detalle.unidadMedida || typeof detalle.unidadMedida !== 'string') {
          errors.push(`Detalle ${index + 1}: unidadMedida es requerida`);
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateCreateReceta,
  validateUpdateReceta
};