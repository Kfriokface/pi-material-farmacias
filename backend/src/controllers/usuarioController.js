const prisma = require('../lib/prisma');

// Campos que se devuelven en los selects de usuario
const usuarioSelect = {
  id: true,
  email: true,
  nombreCompleto: true,
  nombre: true,
  apellido1: true,
  apellido2: true,
  rol: true,
  areaId: true,
  area: { select: { id: true, nombre: true } },
  numeroSAP: true,
  direccion: true,
  codigoPostal: true,
  localidad: true,
  provincia: true,
  telefono: true,
  nif: true,
  destMercancia: true,
  avatar: true,
  activo: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Obtener todos los usuarios
 */
const getAllUsuarios = async (req, res) => {
  try {
    const { page = 1, limit = 20, rol, areaId, search } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { ...req.filterActivo };

    if (rol) where.rol = rol;
    if (areaId) where.areaId = parseInt(areaId);

    if (search) {
      where.OR = [
        { nombre:    { contains: search } },
        { apellido1: { contains: search } },
        { apellido2: { contains: search } },
        { email:     { contains: search } },
      ];
    }

    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        skip,
        take,
        select: usuarioSelect,
        orderBy: [{ apellido1: 'asc' }, { nombre: 'asc' }],
      }),
      prisma.usuario.count({ where }),
    ]);

    res.json({
      success: true,
      data: usuarios,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message,
    });
  }
};

/**
 * Obtener usuario por ID
 */
const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.findFirst({
      where: {
        id: parseInt(id),
        ...req.filterActivo,
      },
      select: {
        ...usuarioSelect,
        establecimientos: {
          where: { activo: true },
          select: {
            id: true,
            nombre: true,
            tipo: true,
            localidad: true,
          },
        },
      },
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    res.json({
      success: true,
      data: usuario,
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message,
    });
  }
};

/**
 * Actualizar usuario
 */
const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      apellido1,
      apellido2,
      rol,
      areaId,
      numeroSAP,
      direccion,
      codigoPostal,
      localidad,
      provincia,
      telefono,
      nif,
      destMercancia,
    } = req.body;

    const existing = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Verificar área si se proporciona
    if (areaId) {
      const area = await prisma.area.findUnique({
        where: { id: parseInt(areaId) },
      });
      if (!area) {
        return res.status(400).json({
          success: false,
          message: 'El área no existe',
        });
      }
    }

    const usuario = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        apellido1,
        apellido2,
        rol,
        areaId: areaId ? parseInt(areaId) : undefined,
        numeroSAP,
        direccion,
        codigoPostal,
        localidad,
        provincia,
        telefono,
        nif,
        destMercancia,
      },
      select: usuarioSelect,
    });

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: usuario,
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: error.message,
    });
  }
};

/**
 * Desactivar usuario (soft delete)
 */
const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes desactivar tu propio usuario',
      });
    }

    const existing = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    const usuario = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: { activo: false },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido1: true,
        rol: true,
        activo: true,
      },
    });

    res.json({
      success: true,
      message: 'Usuario desactivado exitosamente',
      data: usuario,
    });
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desactivar usuario',
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsuarios,
  getUsuarioById,
  updateUsuario,
  deleteUsuario,
};
