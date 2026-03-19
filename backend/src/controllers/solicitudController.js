const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { PATHS } = require('../lib/fileHelper');
const {
  emailSolicitudRechazada,
  emailSolicitudEnFabricacion,
  emailFabricanteConfirmacion,
  emailSolicitudCreada,
  emailSolicitudCompletada,
} = require('../lib/email');

const solicitudInclude = {
  usuario: {
    select: {
      id: true,
      nombre: true,
      apellido1: true,
      apellido2: true,
      email: true,
      direccion: true,
      codigoPostal: true,
      localidad: true,
      zona: { select: { id: true, nombre: true, direccion: true, codigoPostal: true, localidad: true } },
    },
  },
  establecimiento: {
    select: {
      id: true,
      nombre: true,
      tipo: true,
      direccion: true,
      localidad: true,
      provincia: true,
    },
  },
  material: {
    select: {
      id: true,
      nombre: true,
      codigo: true,
      tipoPrecio: true,
      precioPublico: true,
      proveedor: { select: { id: true, nombre: true, contacto: true, emails: true } },
    },
  },
  marca:            { select: { id: true, nombre: true } },
  proveedorEnviado: { select: { id: true, nombre: true, contacto: true, telefono: true, emails: true } },
  fotosInstalacion: true,
};

/**
 * Calcula el importe según el tipo de precio del material
 */
function calcularImporte(material) {
  return material.precioPublico || 0;
}

/**
 * Calcula el gasto anual acumulado de un usuario
 * Solo cuenta solicitudes no rechazadas
 */
async function calcularGastoAnual(where) {
  const inicioAnio = new Date();
  inicioAnio.setMonth(0, 1);
  inicioAnio.setHours(0, 0, 0, 0);

  const solicitudes = await prisma.solicitud.findMany({
    where: {
      ...where,
      estado: { notIn: ['RECHAZADA'] },
      createdAt: { gte: inicioAnio },
    },
    select: { importeTotal: true },
  });

  return solicitudes.reduce((sum, s) => sum + (s.importeTotal || 0), 0);
}

/**
 * Consultar estado de presupuesto antes de crear una solicitud
 * Devuelve si se superarían los límites con el importe dado
 */
const getPresupuesto = async (req, res) => {
  try {
    const { importe = 0 } = req.query;

    const config = await prisma.configuracion.findUnique({ where: { id: 1 } });

    const gastoAnual = await calcularGastoAnual({ usuarioId: req.user.id });

    const importeNum = parseFloat(importe);

    const resultado = {
      usuario: {
        gastoAnual: parseFloat(gastoAnual.toFixed(2)),
        limite:     config?.limiteUsuarioAnual || null,
        superado:   config?.limiteUsuarioAnual
                      ? (gastoAnual + importeNum) > config.limiteUsuarioAnual
                      : false,
      },
    };

    res.json({ success: true, data: resultado });
  } catch (error) {
    console.error('Error al consultar presupuesto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al consultar presupuesto',
      error: error.message,
    });
  }
};

/**
 * Crear solicitud
 */
const createSolicitud = async (req, res) => {
  try {
    const {
      establecimientoId,
      eventoNombre,
      materialId,
      altoCm,
      anchoCm,
      orientacion,
      personalizarNombre       = false,
      descripcionPersonalizada,
      talla,
      personalizacionBata,
      marcaId,
      direccionEntrega,
      codigoPostalEntrega,
      localidadEntrega,
      provinciaEntrega,
      telefonoEntrega,
      observaciones,
    } = req.body;

    // Verificar material primero (necesitamos saber si permiteEvento)
    const material = await prisma.material.findFirst({
      where: { id: parseInt(materialId), activo: true },
    });
    if (!material) {
      return res.status(400).json({ success: false, message: 'Material no encontrado' });
    }

    // Determinar si es una solicitud de evento
    const esEvento = !establecimientoId && !!eventoNombre;

    if (esEvento) {
      // DELEGADOs no pueden crear solicitudes de evento
      if (req.user.rol === 'DELEGADO') {
        return res.status(403).json({
          success: false,
          message: 'Los delegados no pueden crear solicitudes para eventos',
        });
      }
      // El material debe permitir eventos
      if (!material.permiteEvento) {
        return res.status(400).json({
          success: false,
          message: 'Este material no está disponible para eventos',
        });
      }
    } else {
      // Solicitud normal: verificar establecimiento
      if (!establecimientoId) {
        return res.status(400).json({ success: false, message: 'Debe indicar un establecimiento o un nombre de evento' });
      }

      const establecimiento = await prisma.establecimiento.findFirst({
        where: { id: parseInt(establecimientoId), activo: true },
      });
      if (!establecimiento) {
        return res.status(400).json({ success: false, message: 'Establecimiento no encontrado' });
      }

      // DELEGADO solo puede solicitar para sus farmacias
      if (req.user.rol === 'DELEGADO') {
        if (establecimiento.tipo !== 'FARMACIA' || establecimiento.delegadoId !== req.user.id) {
          return res.status(403).json({
            success: false,
            message: 'No tienes permiso para solicitar material para este establecimiento',
          });
        }
      }

      // GERENTE solo puede solicitar para establecimientos de su zona
      if (req.user.rol === 'GERENTE') {
        const delegado = await prisma.usuario.findUnique({
          where: { id: establecimiento.delegadoId },
          select: { zonaId: true },
        });
        if (!delegado || delegado.zonaId !== req.user.zonaId) {
          return res.status(403).json({
            success: false,
            message: 'No tienes permiso para solicitar material para este establecimiento',
          });
        }
      }
      // ADMIN puede solicitar para cualquier establecimiento
    }

    // Validar medidas si el material las requiere
    if (material.permiteAltoAncho && (!altoCm || !anchoCm)) {
      return res.status(400).json({
        success: false,
        message: 'Este material requiere indicar alto y ancho',
      });
    }

    // Validar talla si el material la requiere
    if (material.permiteTalla && !talla) {
      return res.status(400).json({
        success: false,
        message: 'Este material requiere indicar la talla',
      });
    }

    const importeTotal = calcularImporte(material);

    // Calcular aviso de presupuesto anual (límite blando — no bloquea)
    const config = await prisma.configuracion.findUnique({ where: { id: 1 } });
    const gastoAnual = await calcularGastoAnual({ usuarioId: req.user.id });

    const avisoLimiteUsuario = config?.limiteUsuarioAnual
      ? (gastoAnual + importeTotal) > config.limiteUsuarioAnual
      : false;

    const solicitud = await prisma.solicitud.create({
      data: {
        usuarioId:               req.user.id,
        establecimientoId:       establecimientoId ? parseInt(establecimientoId) : null,
        eventoNombre:            eventoNombre || null,
        materialId:              parseInt(materialId),
        importeTotal,
        altoCm:                  altoCm  ? parseInt(altoCm)  : null,
        anchoCm:                 anchoCm ? parseInt(anchoCm) : null,
        orientacion:             orientacion || null,
        personalizarNombre,
        descripcionPersonalizada: descripcionPersonalizada || null,
        talla:                   talla || null,
        personalizacionBata:     personalizacionBata || null,
        marcaId:                 marcaId ? parseInt(marcaId) : null,
        direccionEntrega:        direccionEntrega  || null,
        codigoPostalEntrega:     codigoPostalEntrega || null,
        localidadEntrega:        localidadEntrega || null,
        provinciaEntrega:        provinciaEntrega || null,
        telefonoEntrega:         telefonoEntrega  || null,
        observaciones:           observaciones || null,
        avisoLimiteUsuario,
      },
      include: solicitudInclude,
    });

    // Email de notificación al email de sistema (en background)
    setImmediate(async () => {
      try {
        const cfg = await prisma.configuracion.findUnique({ where: { id: 1 } });
        if (cfg?.emailAdmin) {
          await emailSolicitudCreada({
            solicitud,
            emailSistema: cfg.emailAdmin,
          });
        }
      } catch (err) {
        console.error('[Notificaciones] Error al enviar email de nueva solicitud:', err.message);
      }
    });

    res.status(201).json({
      success: true,
      message: 'Solicitud creada exitosamente',
      data: solicitud,
    });
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear solicitud',
      error: error.message,
    });
  }
};

/**
 * Obtener todas las solicitudes
 */
const getAllSolicitudes = async (req, res) => {
  try {
    const { page = 1, limit = 20, estado, search } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    // DELEGADO solo ve sus solicitudes
    if (req.user.rol === 'DELEGADO') {
      where.usuarioId = req.user.id;
    }

    // GERENTE ve las solicitudes de su zona
    if (req.user.rol === 'GERENTE') {
      where.usuario = { zonaId: req.user.zonaId };
    }

    if (estado) where.estado = estado;

    if (search) {
      where.OR = [
        { establecimiento: { nombre: { contains: search } } },
        { material:        { nombre: { contains: search } } },
        { usuario:         { nombre: { contains: search } } },
      ];
    }

    const [solicitudes, total] = await Promise.all([
      prisma.solicitud.findMany({
        where,
        skip,
        take,
        include: solicitudInclude,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.solicitud.count({ where }),
    ]);

    res.json({
      success: true,
      data: solicitudes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener solicitudes',
      error: error.message,
    });
  }
};

/**
 * Obtener solicitud por ID
 */
const getSolicitudById = async (req, res) => {
  try {
    const { id } = req.params;

    const where = { id: parseInt(id) };
    if (req.user.rol === 'DELEGADO') where.usuarioId = req.user.id;
    if (req.user.rol === 'GERENTE')  where.usuario   = { zonaId: req.user.zonaId };

    const solicitud = await prisma.solicitud.findFirst({
      where,
      include: solicitudInclude,
    });

    if (!solicitud) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    res.json({ success: true, data: solicitud });
  } catch (error) {
    console.error('Error al obtener solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener solicitud',
      error: error.message,
    });
  }
};

/**
 * Cambiar estado de una solicitud (solo ADMIN)
 * Flujo: PENDIENTE → EN_FABRICACION | RECHAZADA
 *        EN_FABRICACION/ENVIADA → COMPLETADA (lo hace el solicitante via /completar)
 *        ENVIADA: la marca el fabricante via token público
 */
const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, observaciones, proveedorEnviadoId } = req.body;

    const solicitud = await prisma.solicitud.findUnique({ where: { id: parseInt(id) } });
    if (!solicitud) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    // Validar transiciones permitidas
    const transicionesValidas = {
      PENDIENTE: ['EN_FABRICACION', 'RECHAZADA'],
    };

    const permitidas = transicionesValidas[solicitud.estado] || [];
    if (!permitidas.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: `No se puede pasar de ${solicitud.estado} a ${estado}`,
        transicionesValidas: permitidas,
      });
    }

    // Construir datos de actualización
    const updateData = { estado };
    if (observaciones) updateData.observaciones = observaciones;

    if (estado === 'RECHAZADA') updateData.rechazadaEn = new Date();

    // Al pasar a EN_FABRICACION: fijar dirección, proveedor y generar token para fabricante
    if (estado === 'EN_FABRICACION') {
      const usuario = await prisma.usuario.findUnique({
        where: { id: solicitud.usuarioId },
        include: {
          zona: {
            include: { gerencias: { include: { gerencia: true }, take: 1 } },
          },
        },
      });

      const gerencia = usuario?.zona?.gerencias?.[0]?.gerencia;

      if (proveedorEnviadoId) {
        updateData.proveedorEnviadoId = parseInt(proveedorEnviadoId);
      } else {
        // Auto-asignar el proveedor del material
        const mat = await prisma.material.findUnique({
          where: { id: solicitud.materialId },
          select: { proveedorId: true },
        });
        if (mat?.proveedorId) updateData.proveedorEnviadoId = mat.proveedorId;
      }

      // Prioridad: dirección indicada en la solicitud → dirección de la gerencia
      updateData.direccionEntregaFinal    = solicitud.direccionEntrega    || gerencia?.direccion    || null;
      updateData.codigoPostalEntregaFinal = solicitud.codigoPostalEntrega || gerencia?.codigoPostal || null;
      updateData.localidadEntregaFinal    = solicitud.localidadEntrega    || gerencia?.localidad    || null;
      updateData.provinciaEntregaFinal    = solicitud.provinciaEntrega    || gerencia?.provincia    || null;
      updateData.telefonoEntregaFinal     = solicitud.telefonoEntrega     || null;

      // Token único para que el fabricante confirme el envío
      updateData.tokenFabricante = crypto.randomBytes(32).toString('hex');
    }

    const updated = await prisma.solicitud.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: solicitudInclude,
    });

    // ── Notificaciones por email (en background, no bloquean la respuesta) ──
    setImmediate(async () => {
      try {
        // Obtener solicitante y su gerente de zona (si lo hay)
        const solicitante = await prisma.usuario.findUnique({
          where: { id: solicitud.usuarioId },
          include: { zona: { include: { gerencias: { include: { gerencia: false } } } } },
        });

        // Buscar gerente de la zona del solicitante
        let gerente = null;
        if (solicitante?.zonaId) {
          gerente = await prisma.usuario.findFirst({
            where: { rol: 'GERENTE', zonaId: solicitante.zonaId, activo: true },
          });
        }

        // Destinatarios: solicitante + gerente (deduplicado si son la misma persona)
        const destinatarios = [solicitante];
        if (gerente && gerente.id !== solicitante?.id) destinatarios.push(gerente);

        if (estado === 'RECHAZADA') {
          for (const dest of destinatarios) {
            if (dest?.email) {
              await emailSolicitudRechazada({ solicitud: updated, destinatario: dest });
            }
          }
        }

        if (estado === 'EN_FABRICACION') {
          for (const dest of destinatarios) {
            if (dest?.email) {
              await emailSolicitudEnFabricacion({ solicitud: updated, destinatario: dest });
            }
          }

          // Email al fabricante con enlace de confirmación
          const proveedor = updated.proveedorEnviado || updated.material?.proveedor;
          if (proveedor?.emails?.length) {
            const emailProduccion = proveedor.emails.find(e => e.tipo === 'PRODUCCION');
            const emailDefault    = proveedor.emails.find(e => e.tipo === 'DEFAULT');
            const emailDest = emailProduccion || emailDefault;
            if (emailDest) {
              await emailFabricanteConfirmacion({
                solicitud:      updated,
                emailProveedor: emailDest.email,
                nombreProveedor: proveedor.nombre,
              });
            }
          }
        }
      } catch (err) {
        console.error('[Notificaciones] Error al enviar emails de estado:', err.message);
      }
    });

    res.json({
      success: true,
      message: `Solicitud actualizada a ${estado.toLowerCase()} exitosamente`,
      data: updated,
    });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado de la solicitud',
      error: error.message,
    });
  }
};

/**
 * Completar solicitud con fotos (DELEGADO)
 * El delegado marca como COMPLETADA y sube fotos de instalación
 */
const completarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;

    const solicitud = await prisma.solicitud.findFirst({
      where: { id: parseInt(id), usuarioId: req.user.id },
    });

    if (!solicitud) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    if (!['EN_FABRICACION', 'ENVIADA'].includes(solicitud.estado)) {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden completar solicitudes en estado EN_FABRICACION o ENVIADA',
      });
    }

    // Las fotos vienen como archivos subidos (multer) — sus URLs se pasan en req.fotosUrls
    // (el middleware de imágenes las procesa antes de llegar aquí)
    const fotosUrls = req.fotosUrls || [];

    const updated = await prisma.solicitud.update({
      where: { id: parseInt(id) },
      data: {
        estado:      'COMPLETADA',
        completadaEn: new Date(),
        fotosInstalacion: {
          create: fotosUrls.map(url => ({ url })),
        },
      },
      include: solicitudInclude,
    });

    // Email al email de sistema (en background)
    setImmediate(async () => {
      try {
        const config = await prisma.configuracion.findUnique({ where: { id: 1 } });
        if (config?.emailAdmin) {
          await emailSolicitudCompletada({
            solicitud: updated,
            emailSistema: config.emailAdmin,
          });
        }
      } catch (err) {
        console.error('[Notificaciones] Error al enviar email de solicitud completada:', err.message);
      }
    });

    res.json({
      success: true,
      message: 'Solicitud completada exitosamente',
      data: updated,
    });
  } catch (error) {
    console.error('Error al completar solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al completar solicitud',
      error: error.message,
    });
  }
};

/**
 * Subir archivo de personalización a una solicitud
 * Acepta imágenes (convertidas a WebP) y PDFs (guardados tal cual)
 * Máximo 5 archivos por solicitud
 */
const uploadArchivoPersonalizacion = async (req, res) => {
  try {
    const { id } = req.params;

    const solicitud = await prisma.solicitud.findFirst({
      where: { id: parseInt(id), usuarioId: req.user.id },
    });

    if (!solicitud) {
      if (req.file) await fs.unlink(req.file.path).catch(() => {});
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se recibió ningún archivo' });
    }

    const archivos = solicitud.archivosPersonalizacion
      ? JSON.parse(solicitud.archivosPersonalizacion)
      : [];

    if (archivos.length >= 5) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ success: false, message: 'Máximo 5 archivos por solicitud' });
    }

    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    let relativePath;

    if (req.file.mimetype === 'application/pdf') {
      const filename = `${unique}.pdf`;
      const destPath = path.join(PATHS.personalizacion, filename);
      await fs.rename(req.file.path, destPath);
      relativePath = `solicitudes/personalizacion/${filename}`;
    } else {
      // Imagen — convertir a WebP con Sharp
      const sharp = require('sharp');
      const filename = `${unique}.webp`;
      const destPath = path.join(PATHS.personalizacion, filename);
      await sharp(req.file.path)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(destPath);
      await fs.unlink(req.file.path).catch(() => {});
      relativePath = `solicitudes/personalizacion/${filename}`;
    }

    archivos.push(relativePath);

    const updated = await prisma.solicitud.update({
      where: { id: parseInt(id) },
      data: { archivosPersonalizacion: JSON.stringify(archivos) },
      select: { id: true, archivosPersonalizacion: true },
    });

    res.json({
      success: true,
      message: 'Archivo subido correctamente',
      data: {
        id: updated.id,
        archivosPersonalizacion: JSON.parse(updated.archivosPersonalizacion || '[]'),
      },
    });
  } catch (error) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    console.error('Error al subir archivo de personalización:', error);
    res.status(500).json({ success: false, message: 'Error al subir archivo', error: error.message });
  }
};

module.exports = {
  createSolicitud,
  getAllSolicitudes,
  getSolicitudById,
  cambiarEstado,
  completarSolicitud,
  getPresupuesto,
  uploadArchivoPersonalizacion,
};