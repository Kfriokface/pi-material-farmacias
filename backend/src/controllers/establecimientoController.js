const prisma = require('../lib/prisma');

// Campos del delegado que se devuelven en los includes
const delegadoSelect = {
  id: true,
  nombre: true,
  apellido1: true,
  apellido2: true,
  email: true,
  direccion: true,
  codigoPostal: true,
  localidad: true,
  provincia: true,
  area: { select: { id: true, nombre: true } },
};

const areaSelect = { id: true, nombre: true };

/**
 * Crear establecimiento
 */
const createEstablecimiento = async (req, res) => {
  try {
    const {
      tipo = 'FARMACIA',
      nombre,
      nif,
      codigoInterno,
      codigoERP,
      direccion,
      codigoPostal,
      localidad,
      provincia,
      telefono,
      lengua = 'ES',
      sanibrick,
      territoryDescr,
      panel,
      ubicacion,
      areaId,
      delegadoId,
    } = req.body;

    // Verificar NIF único si se proporciona
    if (nif) {
      const existing = await prisma.establecimiento.findUnique({ where: { nif } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un establecimiento con este NIF',
        });
      }
    }

    // Verificar delegado si se proporciona
    if (delegadoId) {
      const delegado = await prisma.usuario.findUnique({
        where: { id: parseInt(delegadoId) },
      });

      if (!delegado) {
        return res.status(400).json({
          success: false,
          message: 'El delegado no existe',
        });
      }

      // CLINICA → solo GERENTE
      if (tipo === 'CLINICA' && delegado.rol !== 'GERENTE') {
        return res.status(400).json({
          success: false,
          message: 'Una clínica debe asignarse a un usuario con rol GERENTE',
        });
      }
    }

    const establecimiento = await prisma.establecimiento.create({
      data: {
        tipo,
        nombre,
        nif,
        codigoInterno,
        codigoERP,
        direccion,
        codigoPostal,
        localidad,
        provincia,
        telefono,
        lengua,
        sanibrick,
        territoryDescr,
        panel,
        ubicacion,
        areaId:     areaId ? parseInt(areaId) : null,
        delegadoId: delegadoId ? parseInt(delegadoId) : null,
      },
      include: {
        area:     { select: areaSelect },
        delegado: { select: delegadoSelect },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Establecimiento creado exitosamente',
      data: establecimiento,
    });
  } catch (error) {
    console.error('Error al crear establecimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear establecimiento',
      error: error.message,
    });
  }
};

/**
 * Obtener todos los establecimientos
 */
const getAllEstablecimientos = async (req, res) => {
  try {
    const { page = 1, limit = 20, tipo, search, areaId } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { ...req.filterActivo };

    // DELEGADO solo ve sus farmacias asignadas directamente
    if (req.user.rol === 'DELEGADO') {
      where.delegadoId = req.user.id;
      where.tipo = 'FARMACIA';
    }

    // GERENTE ve farmacias de su área + sus clínicas
    if (req.user.rol === 'GERENTE') {
      where.AND = [
        {
          OR: [
            { tipo: 'FARMACIA', areaId: req.user.areaId },
            { tipo: 'CLINICA',  delegadoId: req.user.id },
          ],
        },
      ];
    }

    // Filtro adicional por tipo si viene en query
    if (tipo) {
      if (req.user.rol === 'ADMIN') {
        where.tipo = tipo;
      } else if (req.user.rol === 'GERENTE') {
        where.AND.push({ tipo });
      }
    }

    // Filtro por área (solo ADMIN)
    if (areaId && req.user.rol === 'ADMIN') {
      where.areaId = parseInt(areaId);
    }

    if (search) {
      const searchCondition = {
        OR: [
          { nombre:    { contains: search } },
          { nif:       { contains: search } },
          { localidad: { contains: search } },
          { provincia: { contains: search } },
        ],
      };
      // Si hay un AND previo (GERENTE), añadir la búsqueda como condición adicional
      // para no sobreescribir el filtro de zona
      if (where.AND) {
        where.AND.push(searchCondition);
      } else {
        where.AND = [searchCondition];
      }
    }

    const [establecimientos, total] = await Promise.all([
      prisma.establecimiento.findMany({
        where,
        skip,
        take,
        include: {
          area:     { select: areaSelect },
          delegado: { select: delegadoSelect },
        },
        orderBy: { nombre: 'asc' },
      }),
      prisma.establecimiento.count({ where }),
    ]);

    res.json({
      success: true,
      data: establecimientos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Error al obtener establecimientos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener establecimientos',
      error: error.message,
    });
  }
};

/**
 * Obtener establecimiento por ID
 */
const getEstablecimientoById = async (req, res) => {
  try {
    const { id } = req.params;

    const where = {
      id: parseInt(id),
      ...req.filterActivo,
    };

    // DELEGADO solo ve sus farmacias asignadas directamente
    if (req.user.rol === 'DELEGADO') {
      where.delegadoId = req.user.id;
      where.tipo = 'FARMACIA';
    }

    const establecimiento = await prisma.establecimiento.findFirst({
      where,
      include: {
        area:     { select: areaSelect },
        delegado: { select: delegadoSelect },
      },
    });

    if (!establecimiento) {
      return res.status(404).json({
        success: false,
        message: 'Establecimiento no encontrado',
      });
    }

    res.json({
      success: true,
      data: establecimiento,
    });
  } catch (error) {
    console.error('Error al obtener establecimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener establecimiento',
      error: error.message,
    });
  }
};

/**
 * Actualizar establecimiento
 */
const updateEstablecimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const existing = await prisma.establecimiento.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Establecimiento no encontrado',
      });
    }

    // Verificar NIF único si cambia
    if (updateData.nif && updateData.nif !== existing.nif) {
      const duplicate = await prisma.establecimiento.findFirst({
        where: { nif: updateData.nif, id: { not: parseInt(id) } },
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un establecimiento con este NIF',
        });
      }
    }

    // Parsear areaId si viene en el body
    if (updateData.areaId !== undefined) {
      updateData.areaId = updateData.areaId ? parseInt(updateData.areaId) : null;
    }

    // Verificar delegado si cambia
    if (updateData.delegadoId) {
      const delegado = await prisma.usuario.findUnique({
        where: { id: parseInt(updateData.delegadoId) },
      });
      if (!delegado) {
        return res.status(400).json({
          success: false,
          message: 'El delegado no existe',
        });
      }
      const tipoFinal = updateData.tipo || existing.tipo;
      if (tipoFinal === 'CLINICA' && delegado.rol !== 'GERENTE') {
        return res.status(400).json({
          success: false,
          message: 'Una clínica debe asignarse a un usuario con rol GERENTE',
        });
      }
      updateData.delegadoId = parseInt(updateData.delegadoId);
    }

    const establecimiento = await prisma.establecimiento.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        area:     { select: areaSelect },
        delegado: { select: delegadoSelect },
      },
    });

    res.json({
      success: true,
      message: 'Establecimiento actualizado exitosamente',
      data: establecimiento,
    });
  } catch (error) {
    console.error('Error al actualizar establecimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar establecimiento',
      error: error.message,
    });
  }
};

/**
 * Desactivar establecimiento (soft delete)
 */
const deleteEstablecimiento = async (req, res) => {
  try {
    const { id } = req.params;

    const establecimiento = await prisma.establecimiento.findUnique({
      where: { id: parseInt(id) },
    });

    if (!establecimiento) {
      return res.status(404).json({
        success: false,
        message: 'Establecimiento no encontrado',
      });
    }

    const updated = await prisma.establecimiento.update({
      where: { id: parseInt(id) },
      data: { activo: false },
    });

    res.json({
      success: true,
      message: 'Establecimiento desactivado exitosamente',
      data: updated,
    });
  } catch (error) {
    console.error('Error al desactivar establecimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desactivar establecimiento',
      error: error.message,
    });
  }
};

module.exports = {
  createEstablecimiento,
  getAllEstablecimientos,
  getEstablecimientoById,
  updateEstablecimiento,
  deleteEstablecimiento,
};
