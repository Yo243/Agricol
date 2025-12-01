// backend/src/routes/cultivos.routes.js
const express = require('express');
const router = express.Router();
const cultivosController = require('../controllers/cultivos.controller');
const { verifyToken } = require('../middlewares/auth.middleware'); // o authenticateToken, el que uses

// Todas las rutas protegidas
router.use(verifyToken);

// ==========================
// RUTAS DE CULTIVOS
// ==========================

// GET /api/cultivos
router.get('/', cultivosController.getCultivos);

// GET /api/cultivos/:id
router.get('/:id', cultivosController.getCultivoById);

// Si luego quieres CRUD:
// router.post('/', cultivosController.createCultivo);
// router.put('/:id', cultivosController.updateCultivo);
// router.delete('/:id', cultivosController.deleteCultivo);

module.exports = router;
