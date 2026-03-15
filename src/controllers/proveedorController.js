const prisma = require('../lib/prisma');

const EMAIL_INCLUDE = {
  emails: {
    orderBy: { tipo: 'asc' },
  },
};

/**
 * Obtener todos los proveedores
 */
const getAllProveedores = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { ...req.filterActivo };

    if (search) {
      where.OR = [
        { nombre:   { contains: search } },
        { nif:      { contains: search } },
        { contacto: { contains: search } },
        { localidad:{ contains: search } },
        { emails: { some: { email: { contains: search } } } },
      ];
    }

    const [proveedores, total] = await Promise.all([
      prisma.proveedor.findMany({
        where,
        skip,
        take,
        include: {
          ...EMAIL_INCLUDE,
          _count: { select: { materiales: true } },
        },
        orderBy: { nombre: 'asc' },
      }),
      prisma.proveedor.count({ where }),
    ]);

    res.json({
      success: true,
      data: proveedores,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener proveedores',
      error: error.message,
    });
  }
};

/**
 * Obtener proveedor por ID
 */
const getProveedorById = async (req, res) => {
  try {
    const { id } = req.params;

    const proveedor = await prisma.proveedor.findFirst({
      where: { id: parseInt(id), ...req.filterActivo },
      include: {
        ...EMAIL_INCLUDE,
        materiales: {
          where: { activo: true },
          select: { id: true, nombre: true, codigo: true },
        },
      },
    });

    if (!proveedor) {
      return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
    }

    res.json({ success: true, data: proveedor });
  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener proveedor',
      error: error.message,
    });
  }
};

/**
 * Crear proveedor
 */
const createProveedor = async (req, res) => {
  try {
    const {
      nombre, nif, direccion, codigoPostal, localidad,
      telefono, contacto, observaciones, emails = [],
    } = req.body;

    if (!nombre) {
      return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
    }

    if (!nif) {
      return res.status(400).json({ success: false, message: 'El NIF es obligatorio' });
    } else {
      const existing = await prisma.proveedor.findUnique({ where: { nif } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Ya existe un proveedor con este NIF' });
      }
    }

    const hasDefault = emails.some(e => e.tipo === 'DEFAULT');
    if (!hasDefault) {
      return res.status(400).json({ success: false, message: 'Es obligatorio indicar un email por defecto (DEFAULT)' });
    }

    const proveedor = await prisma.proveedor.create({
      data: {
        nombre, nif, direccion, codigoPostal, localidad,
        telefono, contacto, observaciones,
        emails: {
          create: emails.map(({ email, tipo }) => ({ email, tipo })),
        },
      },
      include: EMAIL_INCLUDE,
    });

    res.status(201).json({
      success: true,
      message: 'Proveedor creado exitosamente',
      data: proveedor,
    });
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear proveedor',
      error: error.message,
    });
  }
};

/**
 * Actualizar proveedor
 */
const updateProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const { emails, ...rest } = req.body;

    const existing = await prisma.proveedor.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
    }

    if (rest.nif && rest.nif !== existing.nif) {
      const duplicate = await prisma.proveedor.findUnique({ where: { nif: rest.nif } });
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'Ya existe un proveedor con este NIF' });
      }
    }

    if (emails !== undefined) {
      const hasDefault = emails.some(e => e.tipo === 'DEFAULT');
      if (!hasDefault) {
        return res.status(400).json({ success: false, message: 'Es obligatorio indicar un email por defecto (DEFAULT)' });
      }
    }

    const updateOps = {
      where: { id: parseInt(id) },
      data: { ...rest },
      include: EMAIL_INCLUDE,
    };

    let proveedor;
    if (emails !== undefined) {
      // Reemplazar todos los emails en una transacción
      [, proveedor] = await prisma.$transaction([
        prisma.proveedorEmail.deleteMany({ where: { proveedorId: parseInt(id) } }),
        prisma.proveedor.update({
          ...updateOps,
          data: {
            ...rest,
            emails: {
              create: emails.map(({ email, tipo }) => ({ email, tipo })),
            },
          },
        }),
      ]);
    } else {
      proveedor = await prisma.proveedor.update(updateOps);
    }

    res.json({
      success: true,
      message: 'Proveedor actualizado exitosamente',
      data: proveedor,
    });
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar proveedor',
      error: error.message,
    });
  }
};

/**
 * Desactivar proveedor (soft delete)
 */
const deleteProveedor = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.proveedor.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
    }

    const proveedor = await prisma.proveedor.update({
      where: { id: parseInt(id) },
      data: { activo: false },
    });

    res.json({
      success: true,
      message: 'Proveedor desactivado exitosamente',
      data: proveedor,
    });
  } catch (error) {
    console.error('Error al desactivar proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desactivar proveedor',
      error: error.message,
    });
  }
};

module.exports = {
  getAllProveedores,
  getProveedorById,
  createProveedor,
  updateProveedor,
  deleteProveedor,
};
