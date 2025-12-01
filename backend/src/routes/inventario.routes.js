// src/routes/inventario.routes.js
const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventario.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

// 👇 Usa los nombres reales del validator
const { 
  createItemSchema, 
  updateItemSchema, 
  registrarMovimientoSchema 
} = require('../validators/inventario.validator');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Rutas específicas
router.get('/estadisticas', inventarioController.getEstadisticas);
router.get('/buscar', inventarioController.buscarItems);
router.get('/movimientos', inventarioController.getMovimientos);

// ⭐ Aquí usas el schema correcto
router.post(
  '/movimientos',
  validate(registrarMovimientoSchema),
  inventarioController.registrarMovimiento
);

router.get('/alertas', inventarioController.getAlertas);
router.patch('/alertas/:id/leer', inventarioController.marcarAlertaLeida);

// CRUD de items
router.get('/', inventarioController.getItems);
router.get('/:id', inventarioController.getItemById);

router.post(
  '/',
  validate(createItemSchema),
  inventarioController.createItem
);

router.put(
  '/:id',
  validate(updateItemSchema),
  inventarioController.updateItem
);

router.delete('/:id', inventarioController.deleteItem);

module.exports = router;
