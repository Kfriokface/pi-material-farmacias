const prisma = require('../lib/prisma');

/**
 * Crear marca
 */
const createMarca = async (req, res) => {
  try {
    const { nombre, activo = true } = req.body;

    // Verificar nombre único
    const existing = await prisma.marca.findUnique({
      where: { nombre },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una marca con este nombre',
      });
    }

    const marca = await prisma.marca.create({
      data: { nombre, activo },
    });

    res.status(201).json({
      success: true,
      message: 'Marca creada exitosamente',
      data: marca,
    });
  } catch (error) {
    console.error('Error al crear marca:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear marca',
      error: error.message,
    });
  }
};

/**
 * Obtener todas las marcas
 */
const getAllMarcas = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { ...req.filterActivo };

    if (search) {
      where.OR = [
        { nombre: { contains: search } },
      ];
    }

    const [marcas, total] = await Promise.all([
      prisma.marca.findMany({
        where,
        skip,
        take,
        orderBy: { nombre: 'asc' },
        include: { _count: { select: { materiales: true } } },
      }),
      prisma.marca.count({ where }),
    ]);

    res.json({
      success: true,
      data: marcas,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Error al obtener marcas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener marcas', error: error.message });
  }
};

/**
 * Obtener marca por ID
 */
const getMarcaById = async (req, res) => {
  try {
    const { id } = req.params;

    const marca = await prisma.marca.findUnique({
      where: { id: parseInt(id), ...req.filterActivo },
      include: {
        _count: {
          select: { materiales: true },
        },
      },
    });

    if (!marca) {
      return res.status(404).json({
        success: false,
        message: 'Marca no encontrada',
      });
    }

    res.json({
      success: true,
      data: marca,
    });
  } catch (error) {
    console.error('Error al obtener marca:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener marca',
      error: error.message,
    });
  }
};

/**
 * Actualizar marca
 */
const updateMarca = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const existing = await prisma.marca.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Marca no encontrada',
      });
    }

    // Verificar nombre único si se está actualizando
    if (updateData.nombre && updateData.nombre !== existing.nombre) {
      const duplicate = await prisma.marca.findFirst({
        where: {
          nombre: updateData.nombre,
          id: { not: parseInt(id) },
        },
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una marca con este nombre',
        });
      }
    }

    const marca = await prisma.marca.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Marca actualizada exitosamente',
      data: marca,
    });
  } catch (error) {
    console.error('Error al actualizar marca:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar marca',
      error: error.message,
    });
  }
};

/**
 * Eliminar marca (soft delete)
 */
const deleteMarca = async (req, res) => {
  try {
    const { id } = req.params;

    const marca = await prisma.marca.findUnique({
      where: { id: parseInt(id) },
    });

    if (!marca) {
      return res.status(404).json({
        success: false,
        message: 'Marca no encontrada',
      });
    }

    const updated = await prisma.marca.update({
      where: { id: parseInt(id) },
      data: { activo: false },
    });

    res.json({
      success: true,
      message: 'Marca desactivada exitosamente',
      data: updated,
    });
  } catch (error) {
    console.error('Error al eliminar marca:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar marca',
      error: error.message,
    });
  }
};

module.exports = {
  createMarca,
  getAllMarcas,
  getMarcaById,
  updateMarca,
  deleteMarca,
};