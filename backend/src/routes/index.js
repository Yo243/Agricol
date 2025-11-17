const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const inventarioRoutes = require('./inventario.routes');
// Importa otras rutas que tengas...

router.get('/', (req, res) => {
  res.json({
    message: 'AgriCol API v1.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      inventario: '/api/inventario',
      parcelas: '/api/parcelas',
      ordenes: '/api/ordenes',
      reportes: '/api/reportes'
    }
  });
});

// Rutas
router.use('/auth', authRoutes);
router.use('/inventario', inventarioRoutes);
// Agrega otras rutas...

module.exports = router;