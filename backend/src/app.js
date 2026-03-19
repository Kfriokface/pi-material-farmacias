const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

// ============================================
// MIDDLEWARES GLOBALES
// ============================================
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
}));
app.use(express.json());

// Archivos estáticos
const filesPath = process.env.FILES_PATH || path.join(__dirname, '../files');
app.use('/files', express.static(filesPath));

// ============================================
// HEALTH CHECK
// ============================================
app.get('/', (req, res) => {
  res.json({ message: 'API Material Farmacias funcionando' });
});

// ============================================
// RUTAS
// ============================================
app.use('/api/auth',            require('./routes/authRoutes'));

// Usuarios, zonas y gerencias
app.use('/api/usuarios',        require('./routes/usuarioRoutes'));
app.use('/api/zonas',           require('./routes/zonaRoutes'));
app.use('/api/gerencias',       require('./routes/gerenciaRoutes'));

// Catálogo
app.use('/api/materiales',      require('./routes/materialRoutes'));
app.use('/api/materiales',      require('./routes/imagenMaterialRoutes'));
app.use('/api/marcas',          require('./routes/marcaRoutes'));
app.use('/api/proveedores',     require('./routes/proveedorRoutes'));

// Establecimientos (farmacias + clínicas)
app.use('/api/establecimientos', require('./routes/establecimientoRoutes'));

// Solicitudes
app.use('/api/solicitudes',     require('./routes/solicitudRoutes'));

// Configuración
app.use('/api/configuracion',     require('./routes/configuracionRoutes'));

// Fabricante (público — sin autenticación)
app.use('/api/fabricante',        require('./routes/fabricanteRoutes'));

// ============================================
// SWAGGER UI (solo dev y staging)
// ============================================
if (process.env.NODE_ENV !== 'production') {
  const swaggerUi   = require('swagger-ui-express');
  const swaggerSpec = require('./swagger');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
  app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));
  console.log('Swagger UI disponible en /api-docs');
}

module.exports = app;