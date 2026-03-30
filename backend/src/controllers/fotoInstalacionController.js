const prisma = require('../lib/prisma');
const {
  upload,
  processImage,
  deleteFile,
  PATHS,
  getFileUrl,
} = require('../lib/fileHelper');

const MAX_FOTOS = 10;

/**
 * Subir foto de instalación a una solicitud
 * La solicitud debe estar en estado EN_FABRICACION o COMPLETADA
 */
const uploadFotoInstalacion = async (req, res) => {
  try {
    const { id } = req.params;

    const solicitud = await prisma.solicitud.findFirst({
      where: {
        id: parseInt(id),
        // ADMIN puede subir fotos a cualquier solicitud
        // GERENTE y DELEGADO solo a las suyas
        ...(req.user.rol !== 'ADMIN' && { usuarioId: req.user.id }),
      },
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada',
      });
    }

    if (!['EN_FABRICACION', 'COMPLETADA'].includes(solicitud.estado)) {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden subir fotos a solicitudes en estado EN_FABRICACION o COMPLETADA',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha proporcionado ninguna imagen',
      });
    }

    // Verificar límite de fotos
    const totalFotos = await prisma.fotoInstalacion.count({
      where: { solicitudId: parseInt(id) },
    });

    if (totalFotos >= MAX_FOTOS) {
      return res.status(400).json({
        success: false,
        message: `No se pueden subir más de ${MAX_FOTOS} fotos por solicitud`,
      });
    }

    // Procesar imagen
    const filename = await processImage(
      req.file.path,
      PATHS.instalacion,
      'instalacion',
      true
    );

    const relativePath = `solicitudes/instalacion/${filename}`;

    const foto = await prisma.fotoInstalacion.create({
      data: {
        solicitudId: parseInt(id),
        url: relativePath,
      },
    });

    // Al subir foto desde EN_FABRICACION, marcar como COMPLETADA automáticamente
    if (solicitud.estado === 'EN_FABRICACION') {
      await prisma.solicitud.update({
        where: { id: parseInt(id) },
        data: {
          estado:      'COMPLETADA',
          completadaEn: new Date(),
        },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Foto de instalación subida exitosamente',
      data: {
        id:      foto.id,
        url:     relativePath,
        fotoUrl: getFileUrl(relativePath),
        totalFotos: totalFotos + 1,
        maxFotos:   MAX_FOTOS,
      },
    });
  } catch (error) {
    console.error('Error al subir foto de instalación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir foto',
      error: error.message,
    });
  }
};

/**
 * Eliminar foto de instalación
 */
const deleteFotoInstalacion = async (req, res) => {
  try {
    const { id, fotoId } = req.params;

    const foto = await prisma.fotoInstalacion.findFirst({
      where: {
        id:          parseInt(fotoId),
        solicitudId: parseInt(id),
      },
    });

    if (!foto) {
      return res.status(404).json({
        success: false,
        message: 'Foto no encontrada',
      });
    }

    await deleteFile(foto.url);

    await prisma.fotoInstalacion.delete({
      where: { id: parseInt(fotoId) },
    });

    res.json({
      success: true,
      message: 'Foto eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar foto de instalación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar foto',
      error: error.message,
    });
  }
};

module.exports = {
  upload,
  uploadFotoInstalacion,
  deleteFotoInstalacion,
};
