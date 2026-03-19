const path = require('path');
const prisma = require('../lib/prisma');
const { processImage, PATHS, FILES_PATH } = require('../lib/fileHelper');

const materialInclude = {
  marca:     { select: { id: true, nombre: true } },
  proveedor: { select: { id: true, nombre: true, contacto: true } },
};

/**
 * Crear nuevo material
 */
const createMaterial = async (req, res) => {
  try {
    const {
      nombre,
      marcaId,
      proveedorId,
      descripcion,
      precio,
      tipoPrecio                 = 'UNIDAD',
      permiteAltoAncho           = false,
      permitePersonalizar        = false,
      requiereNombreFarmacia     = false,
      permiteTalla               = false,
      permitePersonalizacionBata = false,
      visibleParaDelegado        = true,
      tipoEstablecimiento,
      permiteEvento              = false,
      permiteMarca               = false,
      precioPublico,
      activo                     = true,
    } = req.body;

    // Verificar marca si se proporciona
    if (marcaId) {
      const marca = await prisma.marca.findUnique({ where: { id: parseInt(marcaId) } });
      if (!marca) {
        return res.status(400).json({ success: false, message: 'La marca no existe' });
      }
    }

    // Verificar proveedor si se proporciona
    if (proveedorId) {
      const proveedor = await prisma.proveedor.findUnique({ where: { id: parseInt(proveedorId) } });
      if (!proveedor) {
        return res.status(400).json({ success: false, message: 'El proveedor no existe' });
      }
    }

    const material = await prisma.material.create({
      data: {
        nombre,
        marcaId:                   marcaId     ? parseInt(marcaId)     : null,
        proveedorId:               proveedorId ? parseInt(proveedorId) : null,
        descripcion,
        precio,
        tipoPrecio,
        permiteAltoAncho,
        permitePersonalizar,
        requiereNombreFarmacia,
        permiteTalla,
        permitePersonalizacionBata,
        visibleParaDelegado,
        tipoEstablecimiento:       tipoEstablecimiento || null,
        permiteEvento,
        permiteMarca,
        precioPublico:             precioPublico !== undefined ? parseFloat(precioPublico) || null : null,
        activo,
      },
      include: materialInclude,
    });

    // Código automático MAT-{id} + imagen por defecto
    const updateData = { codigo: `MAT-${material.id}` };

    const defaultSrc = path.join(FILES_PATH, 'materiales', 'default.webp');
    try {
      const filenamePrincipal = await processImage(defaultSrc, PATHS.materialesPrincipales, 'principal', false);
      const filenameThumbnail = await processImage(defaultSrc, PATHS.materialesPrincipales, 'thumbnail', false);
      updateData.imagen    = `materiales/principales/${filenamePrincipal}`;
      updateData.thumbnail = `materiales/principales/${filenameThumbnail}`;
    } catch {
      // default.webp no existe, se continúa sin imagen
    }

    const materialConCodigo = await prisma.material.update({
      where: { id: material.id },
      data: updateData,
      include: materialInclude,
    });

    res.status(201).json({
      success: true,
      message: 'Material creado exitosamente',
      data: materialConCodigo,
    });
  } catch (error) {
    console.error('Error al crear material:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear material',
      error: error.message,
    });
  }
};

/**
 * Obtener todos los materiales
 */
const getAllMaterials = async (req, res) => {
  try {
    const { page = 1, limit = 20, proveedorId, search, tipoEstablecimiento } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { ...req.filterActivo };

    // DELEGADO solo ve materiales marcados como 'visibles para delegados' y que no sean 'clínicas'
    if (req.user?.rol === 'DELEGADO') {
      where.visibleParaDelegado = true;
      where.OR = [
        { tipoEstablecimiento: 'FARMACIA' },
        { tipoEstablecimiento: null }
      ];
    }

    if (tipoEstablecimiento === 'EVENTO') {
      where.permiteEvento = true;
    } else if (tipoEstablecimiento) {
      where.tipoEstablecimiento = tipoEstablecimiento;
    }

    if (proveedorId) where.proveedorId = parseInt(proveedorId);

    if (search) {
      const searchOR = [
        { nombre:      { contains: search } },
        { descripcion: { contains: search } },
        { marca:    { nombre: { contains: search } } },
        { proveedor:{ nombre: { contains: search } } },
      ];
      // Combinar con el OR de tipo (DELEGADO) si existe, usando AND
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchOR }];
        delete where.OR;
      } else {
        where.OR = searchOR;
      }
    }

    const [materiales, total] = await Promise.all([
      prisma.material.findMany({
        where,
        skip,
        take,
        include: materialInclude,
        orderBy: { id: 'desc' },
      }),
      prisma.material.count({ where }),
    ]);

    res.json({
      success: true,
      data: materiales,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Error al obtener materiales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener materiales',
      error: error.message,
    });
  }
};

/**
 * Obtener material por ID
 */
const getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await prisma.material.findFirst({
      where: { id: parseInt(id), ...req.filterActivo },
      include: materialInclude,
    });

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material no encontrado' });
    }

    res.json({ success: true, data: material });
  } catch (error) {
    console.error('Error al obtener material:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener material',
      error: error.message,
    });
  }
};

/**
 * Actualizar material
 */
const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const existing = await prisma.material.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Material no encontrado' });
    }

    // Verificar marca si cambia
    if (body.marcaId) {
      const marca = await prisma.marca.findUnique({ where: { id: parseInt(body.marcaId) } });
      if (!marca) {
        return res.status(400).json({ success: false, message: 'La marca no existe' });
      }
    }

    // Verificar proveedor si cambia
    if (body.proveedorId) {
      const proveedor = await prisma.proveedor.findUnique({ where: { id: parseInt(body.proveedorId) } });
      if (!proveedor) {
        return res.status(400).json({ success: false, message: 'El proveedor no existe' });
      }
    }

    const material = await prisma.material.update({
      where: { id: parseInt(id) },
      data: {
        nombre:                    body.nombre,
        descripcion:               body.descripcion,
        precio:                    body.precio ? parseFloat(body.precio) : null,
        tipoPrecio:                body.tipoPrecio,
        permiteAltoAncho:          body.permiteAltoAncho,
        permitePersonalizar:       body.permitePersonalizar,
        requiereNombreFarmacia:    body.requiereNombreFarmacia,
        permiteTalla:              body.permiteTalla,
        permitePersonalizacionBata: body.permitePersonalizacionBata,
        visibleParaDelegado:       body.visibleParaDelegado !== undefined ? body.visibleParaDelegado : true,
        tipoEstablecimiento:       body.tipoEstablecimiento || null,
        permiteEvento:             body.permiteEvento !== undefined ? body.permiteEvento : false,
        permiteMarca:              body.permiteMarca !== undefined ? body.permiteMarca : false,
        precioPublico:             body.precioPublico !== undefined ? parseFloat(body.precioPublico) || null : undefined,
        activo:                    body.activo,
        marca:     body.marcaId     ? { connect: { id: parseInt(body.marcaId) } }     : { disconnect: true },
        proveedor: body.proveedorId ? { connect: { id: parseInt(body.proveedorId) } } : { disconnect: true },
      },
      include: materialInclude,
    });

    res.json({ success: true, message: 'Material actualizado exitosamente', data: material });
  } catch (error) {
    console.error('Error al actualizar material:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar material', error: error.message });
  }
};

/**
 * Desactivar material (soft delete)
 */
const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await prisma.material.findUnique({ where: { id: parseInt(id) } });
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material no encontrado' });
    }

    const updated = await prisma.material.update({
      where: { id: parseInt(id) },
      data: { activo: false },
      include: materialInclude,
    });

    res.json({
      success: true,
      message: 'Material desactivado exitosamente',
      data: updated,
    });
  } catch (error) {
    console.error('Error al eliminar material:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar material',
      error: error.message,
    });
  }
};

module.exports = {
  createMaterial,
  getAllMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
};