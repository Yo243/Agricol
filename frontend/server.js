const express = require('express');
const path = require('path');

// Obtiene la ruta al directorio de archivos estáticos de Angular
// Asegúrate de que esta ruta sea correcta después de la compilación
const BROWSER_FOLDER = 'dist/frontend/browser';
const PORT = process.env.PORT || 8080; 

const app = express();

// Servir solo los archivos estáticos del navegador
app.use(express.static(path.join(__dirname, BROWSER_FOLDER)));

// Para manejar el routing de SPA (Single Page Application):
// Redirige cualquier solicitud no encontrada a index.html.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, BROWSER_FOLDER, 'index.html'));
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Node Express server listening on http://localhost:${PORT}`);
});