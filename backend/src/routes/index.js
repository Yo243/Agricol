const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const inventarioRoutes = require('./inventario.routes');
const parcelasRoutes = require('./parcelas.routes');  // ← AGREGAR

router.use('/auth', authRoutes);
router.use('/inventario', inventarioRoutes);
router.use('/parcelas', parcelasRoutes);  // ← AGREGAR

router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  });
});

module.exports = router;