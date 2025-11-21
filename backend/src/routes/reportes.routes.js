const express = require('express');
const router = express.Router();

const authenticateToken = require('../middlewares/auth.middleware');
const reportesController = require('../controllers/reportes.controller');

const {
  validateDashboard,
  validateConsumoCultivo,
  validateConsumoParcela,
  validateCostos,
  validateTrazabilidadParcela
} = require('../validators/reportes.validator');

// proteger todas las rutas
router.use(authenticateToken);

router.get('/dashboard', validateDashboard, reportesController.getDashboard);
router.get('/consumo-cultivo', validateConsumoCultivo, reportesController.getConsumoPorCultivo);
router.get('/consumo-parcela', validateConsumoParcela, reportesController.getConsumoPorParcela);
router.get('/costos', validateCostos, reportesController.getCostos);
router.get('/trazabilidad/:parcelaId', validateTrazabilidadParcela, reportesController.getTrazabilidadParcela);

module.exports = router;
