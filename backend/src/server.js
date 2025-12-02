require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

// IMPORTANTE: Railway requiere escuchar en 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📝 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Host: 0.0.0.0:${PORT}`);
});