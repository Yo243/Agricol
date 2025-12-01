const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth.routes');
const inventarioRoutes = require('./inventario.routes');
const parcelaRoutes = require('./parcelas.routes');
const recetaRoutes = require('./receta.routes');
const ordenesRoutes = require('./ordenes.routes');
const reportesRoutes = require('./reportes.routes');
const periodosSiembraRoutes = require('./periodos-siembra.routes');
const usuariosRoutes = require('./usuarios.routes');
const cultivosRoutes = require('./cultivos.routes');
const aplicacionIARoutes = require('./aplicacion-ia.routes'); // ✅ SIN './routes/'

// Registrar rutas
router.use('/auth', authRoutes);
router.use('/inventario', inventarioRoutes);
router.use('/parcelas', parcelaRoutes);
router.use('/recetas', recetaRoutes);
router.use('/ordenes-aplicacion', ordenesRoutes);
router.use('/reportes', reportesRoutes);
router.use('/periodos-siembra', periodosSiembraRoutes);
router.use('/users', usuariosRoutes);
router.use('/cultivos', cultivosRoutes);
router.use('/aplicaciones', aplicacionIARoutes); // ✅ CAMBIADO

module.exports = router;