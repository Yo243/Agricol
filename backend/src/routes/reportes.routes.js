const express = require('express');
const router = express.Router();

const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');
const reportesController = require('../controllers/reportes.controller');

const {
  validateDashboard,
  validateConsumoCultivo,
  validateConsumoParcela,
  validateCostos,
  validateTrazabilidadParcela
} = require('../validators/reportes.validator');

// 🔥 SOLO ADMIN PUEDE ACCEDER A CUALQUIER RUTA DE REPORTES
router.use(authenticateToken, isAdmin);

// ================================
//  RUTAS PRINCIPALES DE REPORTES
// ================================
router.get('/dashboard', validateDashboard, reportesController.getDashboard);
router.get('/consumo-cultivo', validateConsumoCultivo, reportesController.getConsumoPorCultivo);
router.get('/consumo-parcela', validateConsumoParcela, reportesController.getConsumoPorParcela);
router.get('/costos', validateCostos, reportesController.getCostos);
router.get('/trazabilidad/:parcelaId', validateTrazabilidadParcela, reportesController.getTrazabilidadParcela);

// ================================
//  NUEVAS RUTAS (REQUERIMIENTOS)
// ================================

// Alertas completas de inventario (stock + vencimientos)
router.get('/alertas', reportesController.getAlertasInventario);

// Costos por hectárea de un período de siembra
router.get('/costos-hectarea', reportesController.getCostosPorHectarea);

module.exports = router;
