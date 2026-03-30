const prisma = require('../lib/prisma');

/**
 * Obtener todas las áreas
 */
const getAllAreas = async (req, res) => {
  try {
    const { search } = req.query;

    const where = { ...req.filterActivo };

    if (search) {
      where.OR = [
        { nombre:      { contains: search } },
        { descripcion: { contains: search } },
        { localidad:   { contains: search } },
      ];
    }

    const areas = await prisma.area.findMany({
      where,
      include: {
        _count: { select: { usuarios: true } },
        usuarios: {
          where: { rol: 'GERENTE', activo: true },
          select: { id: true, nombre: true, apellido1: true, direccion: true, codigoPostal: true, localidad: true, provincia: true },
          take: 1,
        },
      },
      orderBy: { nombre: 'asc' },
    });

    res.json({ success: true, data: areas });
  } catch (error) {
    console.error('Error al obtener áreas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener áreas',
      error: error.message,
    });
  }
};

/**
 * Obtener área por ID
 */
const getAreaById = async (req, res) => {
  try {
    const { id } = req.params;

    const area = await prisma.area.findFirst({
      where: { id: parseInt(id), ...req.filterActivo },
      include: {
        usuarios: {
          where: { activo: true },
          select: {
            id: true,
            nombre: true,
            apellido1: true,
            apellido2: true,
            email: true,
            rol: true,
          },
        },
      },
    });

    if (!area) {
      return res.status(404).json({ success: false, message: 'Área no encontrada' });
    }

    res.json({ success: true, data: area });
  } catch (error) {
    console.error('Error al obtener área:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener área',
      error: error.message,
    });
  }
};

/**
 * Crear área
 */
const createArea = async (req, res) => {
  try {
    const { nombre, direccion, codigoPostal, localidad } = req.body;

    if (!nombre) {
      return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
    }

    const existing = await prisma.area.findUnique({ where: { nombre } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Ya existe un área con ese nombre' });
    }

    const area = await prisma.area.create({
      data: { nombre, direccion, codigoPostal, localidad },
    });

    res.status(201).json({
      success: true,
      message: 'Área creada exitosamente',
      data: area,
    });
  } catch (error) {
    console.error('Error al crear área:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear área',
      error: error.message,
    });
  }
};

/**
 * Actualizar área
 */
const updateArea = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, direccion, codigoPostal, localidad, activo } = req.body;

    const existing = await prisma.area.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Área no encontrada' });
    }

    // Verificar nombre único si cambia
    if (nombre && nombre !== existing.nombre) {
      const duplicate = await prisma.area.findUnique({ where: { nombre } });
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'Ya existe un área con ese nombre' });
      }
    }

    const area = await prisma.area.update({
      where: { id: parseInt(id) },
      data: { nombre, direccion, codigoPostal, localidad, activo },
    });

    res.json({
      success: true,
      message: 'Área actualizada exitosamente',
      data: area,
    });
  } catch (error) {
    console.error('Error al actualizar área:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar área',
      error: error.message,
    });
  }
};

module.exports = {
  getAllAreas,
  getAreaById,
  createArea,
  updateArea,
};
