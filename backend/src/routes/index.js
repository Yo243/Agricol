const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth.routes');
const inventarioRoutes = require('./inventario.routes');
const parcelaRoutes = require('./parcelas.routes');
const recetaRoutes = require('./receta.routes');
const ordenesRoutes = require('./ordenes.routes'); // ✅ AGREGAR ESTA LÍNEA

// Registrar rutas
router.use('/auth', authRoutes);
router.use('/inventario', inventarioRoutes);
router.use('/parcelas', parcelaRoutes);
router.use('/recetas', recetaRoutes);
router.use('/ordenes-aplicacion', ordenesRoutes); // ✅ AGREGAR ESTA LÍNEA

module.exports = router;