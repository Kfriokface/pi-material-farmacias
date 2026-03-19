const prisma = require('../lib/prisma');

/**
 * Obtener todas las zonas
 */
const getAllZonas = async (req, res) => {
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

    const zonas = await prisma.zona.findMany({
      where,
      include: {
        _count: { select: { usuarios: true } },
      },
      orderBy: { nombre: 'asc' },
    });

    res.json({ success: true, data: zonas });
  } catch (error) {
    console.error('Error al obtener zonas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener zonas',
      error: error.message,
    });
  }
};

/**
 * Obtener zona por ID
 */
const getZonaById = async (req, res) => {
  try {
    const { id } = req.params;

    const zona = await prisma.zona.findFirst({
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

    if (!zona) {
      return res.status(404).json({ success: false, message: 'Zona no encontrada' });
    }

    res.json({ success: true, data: zona });
  } catch (error) {
    console.error('Error al obtener zona:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener zona',
      error: error.message,
    });
  }
};

/**
 * Crear zona
 */
const createZona = async (req, res) => {
  try {
    const { nombre, direccion, codigoPostal, localidad } = req.body;

    if (!nombre) {
      return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
    }

    const existing = await prisma.zona.findUnique({ where: { nombre } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Ya existe una zona con ese nombre' });
    }

    const zona = await prisma.zona.create({
      data: { nombre, direccion, codigoPostal, localidad },
    });

    res.status(201).json({
      success: true,
      message: 'Zona creada exitosamente',
      data: zona,
    });
  } catch (error) {
    console.error('Error al crear zona:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear zona',
      error: error.message,
    });
  }
};

/**
 * Actualizar zona
 */
const updateZona = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, direccion, codigoPostal, localidad, activo } = req.body;

    const existing = await prisma.zona.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Zona no encontrada' });
    }

    // Verificar nombre único si cambia
    if (nombre && nombre !== existing.nombre) {
      const duplicate = await prisma.zona.findUnique({ where: { nombre } });
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'Ya existe una zona con ese nombre' });
      }
    }

    const zona = await prisma.zona.update({
      where: { id: parseInt(id) },
      data: { nombre, direccion, codigoPostal, localidad, activo },
    });

    res.json({
      success: true,
      message: 'Zona actualizada exitosamente',
      data: zona,
    });
  } catch (error) {
    console.error('Error al actualizar zona:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar zona',
      error: error.message,
    });
  }
};

module.exports = {
  getAllZonas,
  getZonaById,
  createZona,
  updateZona,
};