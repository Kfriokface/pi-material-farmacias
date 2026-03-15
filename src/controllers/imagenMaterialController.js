const prisma = require('../lib/prisma');

const {
  upload,
  processImage,
  deleteFile,
  PATHS,
  getFileUrl,
} = require('../lib/fileHelper');

const MAX_GALERIA = 5;

/**
 * Subir imagen principal del material
 */
const uploadImagenPrincipal = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await prisma.material.findUnique({
      where: { id: parseInt(id) },
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material no encontrado',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha proporcionado ninguna imagen',
      });
    }

    // Procesar imagen principal (no eliminar temp todavía)
    const filenamePrincipal = await processImage(
      req.file.path,
      PATHS.materialesPrincipales,
      'principal',
      false
    );

    // Procesar thumbnail (ahora sí eliminar temp)
    const filenameThumbnail = await processImage(
      req.file.path,
      PATHS.materialesPrincipales,
      'thumbnail',
      true
    );

    const relativePath = `materiales/principales/${filenamePrincipal}`;
    const relativeThumbnail = `materiales/principales/${filenameThumbnail}`;

    // Si ya tenía imagen principal o thumbnail, eliminarlos
    if (material.imagen) {
      await deleteFile(material.imagen);
    }
    if (material.thumbnail) {
      await deleteFile(material.thumbnail);
    }

    const updatedMaterial = await prisma.material.update({
      where: { id: parseInt(id) },
      data: {
        imagen: relativePath,
        thumbnail: relativeThumbnail,
      },
      include: { marca: true },
    });

    res.json({
      success: true,
      message: 'Imagen principal actualizada exitosamente',
      data: {
        imagen: relativePath,
        imagenUrl: getFileUrl(relativePath),
        thumbnail: relativeThumbnail,
        thumbnailUrl: getFileUrl(relativeThumbnail),
        material: updatedMaterial,
      },
    });
  } catch (error) {
    console.error('Error al subir imagen principal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir imagen',
      error: error.message,
    });
  }
};

/**
 * Subir imagen a la galería del material
 */
const uploadImagenGaleria = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await prisma.material.findUnique({
      where: { id: parseInt(id) },
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material no encontrado',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha proporcionado ninguna imagen',
      });
    }

    const galeriaActual = material.imagenes
      ? JSON.parse(material.imagenes)
      : [];

    if (galeriaActual.length >= MAX_GALERIA) {
      return res.status(400).json({
        success: false,
        message: `La galería no puede tener más de ${MAX_GALERIA} imágenes`,
      });
    }

    // Galería solo necesita una versión, eliminar temp al procesar
    const filename = await processImage(
      req.file.path,
      PATHS.materialesGaleria,
      'galeria',
      true
    );

    const relativePath = `materiales/galeria/${filename}`;
    const nuevaGaleria = [...galeriaActual, relativePath];

    await prisma.material.update({
      where: { id: parseInt(id) },
      data: { imagenes: JSON.stringify(nuevaGaleria) },
    });

    res.json({
      success: true,
      message: 'Imagen añadida a la galería exitosamente',
      data: {
        imagen: relativePath,
        imagenUrl: getFileUrl(relativePath),
        totalImagenes: nuevaGaleria.length,
        maxImagenes: MAX_GALERIA,
      },
    });
  } catch (error) {
    console.error('Error al subir imagen a galería:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir imagen',
      error: error.message,
    });
  }
};

/**
 * Eliminar imagen de la galería
 */
const deleteImagenGaleria = async (req, res) => {
  try {
    const { id, filename } = req.params;

    const material = await prisma.material.findUnique({
      where: { id: parseInt(id) },
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material no encontrado',
      });
    }

    const galeriaActual = material.imagenes
      ? JSON.parse(material.imagenes)
      : [];

    const relativePath = `materiales/galeria/${filename}`;

    if (!galeriaActual.includes(relativePath)) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada en la galería',
      });
    }

    await deleteFile(relativePath);

    const nuevaGaleria = galeriaActual.filter((img) => img !== relativePath);

    await prisma.material.update({
      where: { id: parseInt(id) },
      data: { imagenes: JSON.stringify(nuevaGaleria) },
    });

    res.json({
      success: true,
      message: 'Imagen eliminada de la galería exitosamente',
      data: {
        totalImagenes: nuevaGaleria.length,
      },
    });
  } catch (error) {
    console.error('Error al eliminar imagen de galería:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar imagen',
      error: error.message,
    });
  }
};

/**
 * Eliminar imagen principal y thumbnail
 */
const deleteImagenPrincipal = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await prisma.material.findUnique({
      where: { id: parseInt(id) },
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material no encontrado',
      });
    }

    if (!material.imagen) {
      return res.status(404).json({
        success: false,
        message: 'El material no tiene imagen principal',
      });
    }

    await deleteFile(material.imagen);

    if (material.thumbnail) {
      await deleteFile(material.thumbnail);
    }

    await prisma.material.update({
      where: { id: parseInt(id) },
      data: {
        imagen: null,
        thumbnail: null,
      },
    });

    res.json({
      success: true,
      message: 'Imagen principal y thumbnail eliminados exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar imagen principal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar imagen',
      error: error.message,
    });
  }
};

module.exports = {
  upload,
  uploadImagenPrincipal,
  uploadImagenGaleria,
  deleteImagenGaleria,
  deleteImagenPrincipal,
};