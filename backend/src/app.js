const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const routes = require('./routes');

const app = express();

// Middlewares de seguridad
app.use(helmet({
  contentSecurityPolicy: false, // Desactivar para permitir Angular
  crossOriginEmbedderPolicy: false
}));

// CORS mejorado para Railway
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:4200',
  'http://localhost:3000',
  'http://localhost:5173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======== HEALTH CHECK (ANTES DE TODO) ========
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AgriCol API funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ======== RUTAS DE API ========
app.use('/api', routes);

// ======== RUTA DE PRUEBA API ========
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

// ======== SERVIR FRONTEND ANGULAR (SOLO SI EXISTE) ========
const publicPath = path.join(__dirname, '../public');
const fs = require('fs');

// Verificar si existe el directorio public (para Railway sin frontend)
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
  
  // Servir Angular para todas las demás rutas
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
} else {
  // Si no hay frontend, solo API
  app.get('*', (req, res) => {
    res.status(404).json({
      error: 'Ruta no encontrada',
      message: 'Esta es una API REST. Usa /api para acceder a los endpoints.'
    });
  });
}

// ======== MANEJO DE ERRORES ========
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  
  // No enviar stack trace en producción
  const errorResponse = {
    error: err.message || 'Error interno del servidor',
    status: err.status || 500
  };
  
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
  }
  
  res.status(err.status || 500).json(errorResponse);
});

module.exports = app;