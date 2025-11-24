const express = require('express');
const router = express.Router();
const ordenesController = require('../controllers/ordenes.controller');
const { verifyToken } = require('../middlewares/auth.middleware');  // ← CORREGIDO

// Aplicar autenticación a todas las rutas
router.use(verifyToken);  // ← CORREGIDO

// Rutas básicas CRUD
router.get('/', ordenesController.getAll);
router.get('/:id', ordenesController.getById);
router.post('/', ordenesController.create);
router.put('/:id', ordenesController.update);
router.delete('/:id', ordenesController.delete);

// Operaciones especiales
router.post('/:id/cerrar', ordenesController.cerrarOrden);
router.post('/:id/cancelar', ordenesController.cancelarOrden);
router.post('/validar-stock', ordenesController.validarStock);

// Reportes y consultas
router.get('/historial/parcela/:parcelaId', ordenesController.getHistorialParcela);
router.get('/estadisticas', ordenesController.getEstadisticas);

module.exports = router;