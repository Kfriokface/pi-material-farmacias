const path = require('path');
const fs = require('fs').promises;
const prisma = require('../lib/prisma');
const { PATHS } = require('../lib/fileHelper');
const {
  emailSolicitudRechazada,
  emailSolicitudEnFabricacion,
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
      rol: true,
      direccion: true,
      codigoPostal: true,
      localidad: true,
      area: { select: { id: true, nombre: true, direccion: true, codigoPostal: true, localidad: true } },
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
      tipoEstablecimiento: true,
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
 * Calcula el presupuesto de un área para un año fiscal natural.
 * Excluye solicitudes RECHAZADAS y materiales de tipo CLINICA.
 * Devuelve: limite, gastadoReal, comprometido, disponibleReal, disponibleNeto
 */
async function calcularPresupuestoArea(areaId, anio) {
  const [config, nFarmacias, solicitudes] = await Promise.all([
    prisma.configuracion.findUnique({ where: { id: 1 } }),
    prisma.establecimiento.count({
      where: { areaId, tipo: 'FARMACIA', activo: true },
    }),
    prisma.solicitud.findMany({
      where: {
        areaId,
        anio,
        estado:   { not: 'RECHAZADA' },
        material: { tipoEstablecimiento: { not: 'CLINICA' } },
      },
      select: { importeTotal: true, estado: true },
    }),
  ]);

  const limitePorFarmacia = config?.limiteAnualPorFarmacia || 0;
  const limite            = parseFloat((limitePorFarmacia * nFarmacias).toFixed(2));

  const gastadoReal = parseFloat(
    solicitudes
      .filter(s => s.estado === 'EN_FABRICACION' || s.estado === 'COMPLETADA')
      .reduce((sum, s) => sum + (s.importeTotal || 0), 0)
      .toFixed(2)
  );

  const comprometido = parseFloat(
    solicitudes
      .filter(s => s.estado === 'PENDIENTE')
      .reduce((sum, s) => sum + (s.importeTotal || 0), 0)
      .toFixed(2)
  );

  const disponibleReal = parseFloat((limite - gastadoReal).toFixed(2));
  const disponibleNeto = parseFloat((limite - gastadoReal - comprometido).toFixed(2));

  return { limite, gastadoReal, comprometido, disponibleReal, disponibleNeto };
}

/**
 * Consultar presupuesto de un área
 * Query params: areaId (opcional, si no se pasa usa el área del usuario autenticado)
 *               importe (opcional, para consultar si superaría el disponible neto)
 */
const getPresupuesto = async (req, res) => {
  try {
    const { areaId: areaIdQuery, importe = 0 } = req.query;

    const areaId = areaIdQuery ? parseInt(areaIdQuery) : req.user.areaId;
    if (!areaId) {
      return res.status(400).json({ success: false, message: 'No se pudo determinar el área' });
    }

    const anio        = new Date().getFullYear();
    const presupuesto = await calcularPresupuestoArea(areaId, anio);
    const importeNum  = parseFloat(importe);

    res.json({
      success: true,
      data: {
        ...presupuesto,
        anio,
        importeConsulta:       importeNum,
        superaDisponibleNeto:  importeNum > 0 ? (presupuesto.disponibleNeto - importeNum) < 0 : false,
      },
    });
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
      imputadoId: imputadoIdBody,
      materialId,
      altoCm,
      anchoCm,
      orientacion,
      lenguaPersonalizacion,
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

    let establecimiento = null;
    const material = await prisma.material.findFirst({
      where: { id: parseInt(materialId), activo: true },
    });
    if (!material) {
      return res.status(400).json({ success: false, message: 'Material no encontrado' });
    }

    const esEvento = material.tipoEstablecimiento === 'EVENTO';

    if (esEvento) {
      // DELEGADOs no pueden crear solicitudes de evento
      if (req.user.rol === 'DELEGADO') {
        return res.status(403).json({
          success: false,
          message: 'Los delegados no pueden crear solicitudes para eventos',
        });
      }
    } else {
      // Solicitud normal: verificar establecimiento
      if (!establecimientoId) {
        return res.status(400).json({ success: false, message: 'Debe indicar un establecimiento' });
      }

      establecimiento = await prisma.establecimiento.findFirst({
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

      // GERENTE solo puede solicitar para establecimientos de su área
      if (req.user.rol === 'GERENTE') {
        const delegado = await prisma.usuario.findUnique({
          where: { id: establecimiento.delegadoId },
          select: { areaId: true },
        });
        if (!delegado || delegado.areaId !== req.user.areaId) {
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

    // Validar máximos de medidas
    if (material.altoMaxCm && altoCm > material.altoMaxCm) {
      return res.status(400).json({
        success: false,
        message: `El alto no puede superar ${material.altoMaxCm} cm para este material`,
      });
    }
    if (material.anchoMaxCm && anchoCm > material.anchoMaxCm) {
      return res.status(400).json({
        success: false,
        message: `El ancho no puede superar ${material.anchoMaxCm} cm para este material`,
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
    const anio         = new Date().getFullYear();

    // Derivar imputadoId y areaId según tipo de material y rol
    let imputadoId, areaId;

    if (esEvento) {
      if (req.user.rol === 'ADMIN') {
        if (!imputadoIdBody) {
          return res.status(400).json({ success: false, message: 'Debe indicar a quién imputar el gasto del evento' });
        }
        const imputado = await prisma.usuario.findUnique({
          where:  { id: parseInt(imputadoIdBody) },
          select: { id: true, rol: true, areaId: true },
        });
        if (!imputado || imputado.rol !== 'GERENTE') {
          return res.status(400).json({ success: false, message: 'El imputado debe ser un gerente' });
        }
        imputadoId = imputado.id;
        areaId     = imputado.areaId;
      } else {
        // GERENTE crea evento — se imputa a sí mismo
        imputadoId = req.user.id;
        areaId     = req.user.areaId;
      }
    } else {
      imputadoId = establecimiento.delegadoId || null;
      areaId     = establecimiento.areaId     || null;
    }

    // Calcular aviso de presupuesto del área (límite blando — no bloquea)
    let avisoLimiteArea = false;
    if (areaId) {
      const presupuesto = await calcularPresupuestoArea(areaId, anio);
      avisoLimiteArea = (presupuesto.disponibleNeto - importeTotal) < 0;
    }

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
        lenguaPersonalizacion:    lenguaPersonalizacion    || null,
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
        imputadoId:              imputadoId || null,
        areaId:                  areaId     || null,
        anio,
        avisoLimiteArea,
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
    const { page = 1, limit = 20, estado, search, establecimientoId, anio } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    // DELEGADO ve sus solicitudes + las imputadas a él (creadas por gerente/admin para sus farmacias)
    if (req.user.rol === 'DELEGADO') {
      where.OR = [
        { usuarioId: req.user.id },
        { imputadoId: req.user.id },
      ];
    }

    // GERENTE ve las solicitudes de su área
    if (req.user.rol === 'GERENTE') {
      where.usuario = { areaId: req.user.areaId };
    }

    if (estado) where.estado = estado;
    if (establecimientoId) where.establecimientoId = parseInt(establecimientoId);
    if (anio) where.anio = parseInt(anio);

    if (search) {
      const searchOr = [
        { establecimiento: { nombre: { contains: search } } },
        { material:        { nombre: { contains: search } } },
        { usuario:         { nombre: { contains: search } } },
      ];
      // Si ya hay un OR (del filtro de DELEGADO), combinamos via AND para no sobreescribirlo
      if (where.OR) {
        where.AND = [{ OR: searchOr }];
      } else {
        where.OR = searchOr;
      }
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
    if (req.user.rol === 'GERENTE')  where.usuario   = { areaId: req.user.areaId };

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
 *        EN_FABRICACION → COMPLETADA (lo hace el solicitante via /completar)
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

    // Al pasar a EN_FABRICACION: fijar dirección y proveedor
    if (estado === 'EN_FABRICACION') {
      const usuario = await prisma.usuario.findUnique({
        where: { id: solicitud.usuarioId },
        include: {
          area: {
            include: { gerencias: { include: { gerencia: true }, take: 1 } },
          },
        },
      });

      const gerencia = usuario?.area?.gerencias?.[0]?.gerencia;

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

    }

    const updated = await prisma.solicitud.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: solicitudInclude,
    });

    // ── Notificaciones por email (en background, no bloquean la respuesta) ──
    setImmediate(async () => {
      try {
        // Obtener solicitante y su gerente de área (si lo hay)
        const solicitante = await prisma.usuario.findUnique({
          where: { id: solicitud.usuarioId },
          include: { area: { include: { gerencias: { include: { gerencia: false } } } } },
        });

        // Buscar gerente del área del solicitante
        let gerente = null;
        if (solicitante?.areaId) {
          gerente = await prisma.usuario.findFirst({
            where: { rol: 'GERENTE', areaId: solicitante.areaId, activo: true },
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

          // Email al fabricante (sin enlace de confirmación)
          const proveedor = updated.proveedorEnviado || updated.material?.proveedor;
          if (proveedor?.emails?.length) {
            const emailProduccion = proveedor.emails.find(e => e.tipo === 'PRODUCCION');
            const emailDefault    = proveedor.emails.find(e => e.tipo === 'DEFAULT');
            const emailDest = emailProduccion || emailDefault;
            if (emailDest) {
              const { emailFabricanteNuevoPedido } = require('../lib/email');
              await emailFabricanteNuevoPedido({
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

    if (solicitud.estado !== 'EN_FABRICACION') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden completar solicitudes en estado EN_FABRICACION',
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
