const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const routes = require('./routes');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======== SERVIR FRONTEND ANGULAR ========
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// ======== RUTAS DE API ========
app.use('/api', routes);

// ======== RUTA DE PRUEBA (SOLO API) ========
app.get('/api', (req, res) => {
  res.json({
    message: '✅ API AgriCol funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      inventario: '/api/inventario',
      parcelas: '/api/parcelas',
      recetas: '/api/recetas'
    }
  });
});

// ======== SERVIR ANGULAR PARA TODAS LAS DEMÁS RUTAS ========
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Manejo de errores generales API
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
});

module.exports = app;



