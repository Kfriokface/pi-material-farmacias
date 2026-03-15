require('dotenv').config();
const app = require('./src/app');
const { ensureDirectories } = require('./src/lib/fileHelper');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Crear directorios necesarios
    await ensureDirectories();
    
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
      console.log(`Files path: ${process.env.FILES_PATH || './files'}`);
      console.log(`Files URL: ${process.env.FILES_URL || `http://localhost:${PORT}/files`}`);
    });
  } catch (error) {
    console.error('Error iniciando servidor:', error);
    process.exit(1); // por convención estándar de Unix/Linux
  }
}

startServer();