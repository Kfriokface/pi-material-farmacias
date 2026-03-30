const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const multer = require('multer');
const sharp = require('sharp');

const FILES_PATH = process.env.FILES_PATH || path.join(__dirname, '../../files');
console.log('FILES_PATH:', FILES_PATH);
console.log('TEMP PATH:', path.join(FILES_PATH, 'temp'));
const FILES_URL = process.env.FILES_URL || 'http://localhost:3000/files';

// Formatos permitidos
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Configuración Sharp por tipo
const SHARP_CONFIG = {
  principal:   { width: 800,  height: 600,  fit: 'cover',  withoutEnlargement: true },
  thumbnail:   { width: 400,  height: 300,  fit: 'cover',  withoutEnlargement: true },
  galeria:     { width: 800,  height: 600,  fit: 'cover',  withoutEnlargement: true },
  zoom:        { width: 800,  height: null, fit: 'inside', withoutEnlargement: true },
  avatar:      { width: 400,  height: 400,  fit: 'cover',  withoutEnlargement: true },
  instalacion: { width: 1200, height: 900,  fit: 'cover',  withoutEnlargement: true },
};
// Rutas de directorios
const PATHS = {
  temp:                  path.join(FILES_PATH, 'temp'),
  avatars:               path.join(FILES_PATH, 'avatars'),
  materialesPrincipales: path.join(FILES_PATH, 'materiales', 'principales'),
  materialesGaleria:     path.join(FILES_PATH, 'materiales', 'galeria'),
  instalacion:           path.join(FILES_PATH, 'solicitudes', 'instalacion'),
  personalizacion:       path.join(FILES_PATH, 'solicitudes', 'personalizacion'),
};

/**
 * Asegura que existan los directorios necesarios
 */
async function ensureDirectories() {
  const dirs = Object.values(PATHS);
  for (const dir of dirs) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
      console.log(`Directorio creado: ${dir}`);
    }
  }
}

/**
 * Configuración de multer - guarda en temp
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PATHS.temp);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `temp-${unique}${ext}`);
  },
});

/**
 * Filtro de tipos de archivo
 */
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato no válido. Usa jpg, png o webp'), false);
  }
};

/**
 * Instancia de multer
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 4 * 1024 * 1024, // 4MB
  },
});

/**
 * Filtro para archivos de personalización (imágenes + PDF)
 */
const archivoFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato no válido. Usa jpg, png, webp o pdf'), false);
  }
};

/**
 * Instancia de multer para archivos de personalización (imágenes + PDF)
 */
const uploadArchivo = multer({
  storage,
  fileFilter: archivoFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

/**
 * Procesar imagen con Sharp
 * @param {string} inputPath - Ruta del archivo temporal
 * @param {string} outputDir - Directorio destino
 * @param {string} tipo - 'principal' | 'galeria' | 'avatar'
 * @returns {string} - Ruta relativa del archivo procesado
 */
async function processImage(inputPath, outputDir, tipo = 'principal', deleteTemp = true) {
  const config = SHARP_CONFIG[tipo];
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
  const outputPath = path.join(outputDir, filename);

  await sharp(inputPath)
    .resize(config.width, config.height, {
      fit: config.fit,
      position: 'centre',
      withoutEnlargement: config.withoutEnlargement,
    })
    .webp({ quality: 80 })
    .toFile(outputPath);

  if (deleteTemp) {
    fsSync.unlinkSync(inputPath);
  }

  return filename;
}

/**
 * Obtiene la URL completa de un archivo
 */
function getFileUrl(relativePath) {
  if (!relativePath) return null;
  if (relativePath.startsWith('http')) return relativePath;
  return `${FILES_URL}/${relativePath}`;
}

/**
 * Obtiene la ruta física de un archivo
 */
function getFilePath(relativePath) {
  return path.join(FILES_PATH, relativePath);
}

/**
 * Obtiene la URL del avatar del usuario
 */
function getAvatarUrl(usuario) {
  if (usuario.avatar) return getFileUrl(usuario.avatar);
  if (usuario.avatarEntraId) return usuario.avatarEntraId;
  return getFileUrl('avatars/default.webp');
}

/**
 * Obtiene la URL de la imagen principal de un material
 */
function getMaterialImageUrl(material) {
  if (material.imagen) return getFileUrl(material.imagen);
  return getFileUrl('materiales/default.webp');
}

/**
 * Elimina un archivo
 */
async function deleteFile(relativePath) {
  try {
    const filePath = getFilePath(relativePath);
    await fs.unlink(filePath);
    console.log(`Archivo eliminado: ${relativePath}`);
  } catch (error) {
    console.error(`Error eliminando archivo: ${relativePath}`, error);
  }
}

module.exports = {
  FILES_PATH,
  FILES_URL,
  PATHS,
  upload,
  uploadArchivo,
  processImage,
  ensureDirectories,
  getFileUrl,
  getFilePath,
  getAvatarUrl,
  getMaterialImageUrl,
  deleteFile,
};