const prisma = require('../lib/prisma');

const gerenciaInclude = {
  zonas: {
    include: {
      zona: { select: { id: true, nombre: true } },
    },
    orderBy: { zona: { nombre: 'asc' } },
  },
};

/**
 * Obtener todas las gerencias
 */
const getAllGerencias = async (req, res) => {
  try {
    const where = { ...req.filterActivo };

    const gerencias = await prisma.gerencia.findMany({
      where,
      include: {
        _count: { select: { zonas: true } },
        zonas: {
          include: { zona: { select: { id: true, nombre: true } } },
          orderBy: { zona: { nombre: 'asc' } },
        },
      },
      orderBy: { nombre: 'asc' },
    });

    res.json({ success: true, data: gerencias });
  } catch (error) {
    console.error('Error al obtener gerencias:', error);
    res.status(500).json({ success: false, message: 'Error al obtener gerencias', error: error.message });
  }
};

/**
 * Obtener gerencia por ID
 */
const getGerenciaById = async (req, res) => {
  try {
    const { id } = req.params;

    const gerencia = await prisma.gerencia.findFirst({
      where: { id: parseInt(id), ...req.filterActivo },
      include: gerenciaInclude,
    });

    if (!gerencia) {
      return res.status(404).json({ success: false, message: 'Gerencia no encontrada' });
    }

    res.json({ success: true, data: gerencia });
  } catch (error) {
    console.error('Error al obtener gerencia:', error);
    res.status(500).json({ success: false, message: 'Error al obtener gerencia', error: error.message });
  }
};

/**
 * Crear gerencia
 */
const createGerencia = async (req, res) => {
  try {
    const { nombre, descripcion, direccion, codigoPostal, localidad, provincia, zonaIds = [] } = req.body;

    const existing = await prisma.gerencia.findUnique({ where: { nombre } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Ya existe una gerencia con ese nombre' });
    }

    const gerencia = await prisma.gerencia.create({
      data: {
        nombre,
        descripcion:  descripcion  || null,
        direccion:    direccion    || null,
        codigoPostal: codigoPostal || null,
        localidad:    localidad    || null,
        provincia:    provincia    || null,
        zonas: {
          create: zonaIds.map((zonaId) => ({ zonaId: parseInt(zonaId) })),
        },
      },
      include: gerenciaInclude,
    });

    res.status(201).json({ success: true, message: 'Gerencia creada exitosamente', data: gerencia });
  } catch (error) {
    console.error('Error al crear gerencia:', error);
    res.status(500).json({ success: false, message: 'Error al crear gerencia', error: error.message });
  }
};

/**
 * Actualizar gerencia (nombre, activo y reemplazo de zonas)
 */
const updateGerencia = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, direccion, codigoPostal, localidad, provincia, activo, zonaIds } = req.body;

    const existing = await prisma.gerencia.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Gerencia no encontrada' });
    }

    if (nombre && nombre !== existing.nombre) {
      const duplicate = await prisma.gerencia.findUnique({ where: { nombre } });
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'Ya existe una gerencia con ese nombre' });
      }
    }

    const updateData = {};
    if (nombre      !== undefined) updateData.nombre      = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion || null;
    if (direccion   !== undefined) updateData.direccion   = direccion   || null;
    if (codigoPostal !== undefined) updateData.codigoPostal = codigoPostal || null;
    if (localidad   !== undefined) updateData.localidad   = localidad   || null;
    if (provincia   !== undefined) updateData.provincia   = provincia   || null;
    if (activo      !== undefined) updateData.activo      = activo;

    // Si se envía zonaIds, reemplazar todas las zonas
    if (zonaIds !== undefined) {
      await prisma.$transaction([
        prisma.gerenciaZona.deleteMany({ where: { gerenciaId: parseInt(id) } }),
        prisma.gerenciaZona.createMany({
          data: zonaIds.map((zonaId) => ({ gerenciaId: parseInt(id), zonaId: parseInt(zonaId) })),
        }),
      ]);
    }

    const gerencia = await prisma.gerencia.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: gerenciaInclude,
    });

    res.json({ success: true, message: 'Gerencia actualizada exitosamente', data: gerencia });
  } catch (error) {
    console.error('Error al actualizar gerencia:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar gerencia', error: error.message });
  }
};

module.exports = {
  getAllGerencias,
  getGerenciaById,
  createGerencia,
  updateGerencia,
};
