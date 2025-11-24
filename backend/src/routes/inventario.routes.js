const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventario.controller');
const { verifyToken } = require('../middlewares/auth.middleware');  // ← CORREGIDO
const validate = require('../middlewares/validate.middleware');
const { 
  validateCreateItem, 
  validateUpdateItem, 
  validateMovimiento 
} = require('../validators/inventario.validator');

// Todas las rutas requieren autenticación
router.use(verifyToken);  // ← CORREGIDO

// Rutas específicas (ANTES de /:id)
router.get('/estadisticas', inventarioController.getEstadisticas);
router.get('/buscar', inventarioController.buscarItems);
router.get('/movimientos', inventarioController.getMovimientos);
router.post('/movimientos', validate(validateMovimiento), inventarioController.registrarMovimiento);
router.get('/alertas', inventarioController.getAlertas);
router.patch('/alertas/:id/leer', inventarioController.marcarAlertaLeida);

// CRUD de items (/:id al final)
router.get('/', inventarioController.getItems);
router.get('/:id', inventarioController.getItemById);
router.post('/', validate(validateCreateItem), inventarioController.createItem);
router.put('/:id', validate(validateUpdateItem), inventarioController.updateItem);
router.delete('/:id', inventarioController.deleteItem);

module.exports = router;