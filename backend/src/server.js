require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en ${PORT}`);
  console.log(`📝 Entorno: ${process.env.NODE_ENV}`);
});



