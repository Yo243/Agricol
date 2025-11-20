const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth.routes');
const inventarioRoutes = require('./inventario.routes');
const parcelaRoutes = require('./parcelas.routes'); // Si ya lo tienes
const recetaRoutes = require('./receta.routes');

// Registrar rutas
router.use('/auth', authRoutes);
router.use('/inventario', inventarioRoutes);
router.use('/parcelas', parcelaRoutes); // Si ya lo tienes
router.use('/recetas', recetaRoutes);

module.exports = router;
