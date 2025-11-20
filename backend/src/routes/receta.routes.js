const express = require('express');
const router = express.Router();
const recetaController = require('../controllers/receta.controller');
// const authMiddleware = require('../middlewares/auth.middleware'); // Si tienes autenticación

// Rutas de utilidad (deben ir primero para evitar conflictos con :id)
router.get('/cultivos', recetaController.getCultivos);
router.get('/etapas', recetaController.getEtapas);
router.get('/cultivo/:cultivoId', recetaController.getByCultivo);

// Rutas CRUD principales
router.post('/', recetaController.create);
router.get('/', recetaController.getAll);
router.get('/:id', recetaController.getById);
router.put('/:id', recetaController.update);
router.delete('/:id', recetaController.delete);

module.exports = router;