// backend/src/routes/aplicacion-ia.routes.js

const express = require('express');
const router = express.Router();
const { 
  obtenerSugerenciaIA, 
  obtenerSugerenciaConHistorial 
} = require('../controllers/aplicacion-ia.controller');

/**
 * POST /api/aplicaciones/sugerencia-ia
 * Obtiene sugerencias de IA para una aplicación
 */
router.post('/sugerencia-ia', obtenerSugerenciaIA);

/**
 * POST /api/aplicaciones/sugerencia-ia/historial
 * Obtiene sugerencias basadas en historial de la parcela
 */
router.post('/sugerencia-ia/historial', obtenerSugerenciaConHistorial);

module.exports = router;