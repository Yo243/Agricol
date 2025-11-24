const express = require('express');
const router = express.Router();
const parcelasController = require('../controllers/parcelas.controller');
const { verifyToken } = require('../middlewares/auth.middleware');  // ← LÍNEA 4 CORREGIDA

// Todas las rutas requieren autenticación
router.use(verifyToken);  // ← LÍNEA 7 CORREGIDA

// ==========================================
// RUTAS DE PARCELAS
// ==========================================

// Estadísticas y reportes (antes de /:id)
router.get('/estadisticas', parcelasController.getEstadisticasParcelas);
router.get('/reporte-produccion', parcelasController.getReporteProduccion);
router.get('/:parcelaId/trazabilidad', parcelasController.getTrazabilidad);

// CRUD de parcelas
router.get('/', parcelasController.getParcelas);
router.get('/:id', parcelasController.getParcelaById);
router.post('/', parcelasController.createParcela);
router.put('/:id', parcelasController.updateParcela);
router.delete('/:id', parcelasController.deleteParcela);

// ==========================================
// RUTAS DE PERÍODOS DE SIEMBRA
// ==========================================

router.get('/periodos/list', parcelasController.getPeriodosSiembra);
router.post('/periodos', parcelasController.createPeriodoSiembra);
router.put('/periodos/:id', parcelasController.updatePeriodoSiembra);
router.patch('/periodos/:id/finalizar', parcelasController.finalizarPeriodoSiembra);

// ==========================================
// RUTAS DE APLICACIONES
// ==========================================

router.get('/aplicaciones/list', parcelasController.getAplicaciones);
router.post('/aplicaciones', parcelasController.registrarAplicacion);

module.exports = router;