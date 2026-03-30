const prisma = require('../lib/prisma');

const agendaSelect = {
  id: true,
  nombre: true,
  direccion: true,
  codigoPostal: true,
  localidad: true,
  provincia: true,
  activo: true,
  createdAt: true,
};

/**
 * Listar direcciones de agenda del usuario autenticado
 */
const getAgenda = async (req, res) => {
  try {
    const direcciones = await prisma.direccionAgenda.findMany({
      where: { usuarioId: req.user.id, activo: true },
      select: agendaSelect,
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: direcciones });
  } catch (error) {
    console.error('Error al obtener agenda:', error);
    res.status(500).json({ success: false, message: 'Error al obtener agenda' });
  }
};

/**
 * Crear dirección en la agenda
 */
const createDireccion = async (req, res) => {
  try {
    const { nombre, direccion, codigoPostal, localidad, provincia } = req.body;

    const nueva = await prisma.direccionAgenda.create({
      data: {
        usuarioId: req.user.id,
        nombre,
        direccion,
        codigoPostal,
        localidad,
        provincia,
      },
      select: agendaSelect,
    });

    res.status(201).json({ success: true, data: nueva });
  } catch (error) {
    console.error('Error al crear dirección:', error);
    res.status(500).json({ success: false, message: 'Error al crear dirección' });
  }
};

/**
 * Actualizar dirección de la agenda
 */
const updateDireccion = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, direccion, codigoPostal, localidad, provincia } = req.body;

    const existing = await prisma.direccionAgenda.findFirst({
      where: { id: parseInt(id), usuarioId: req.user.id, activo: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Dirección no encontrada' });
    }

    const actualizada = await prisma.direccionAgenda.update({
      where: { id: parseInt(id) },
      data: { nombre, direccion, codigoPostal, localidad, provincia },
      select: agendaSelect,
    });

    res.json({ success: true, data: actualizada });
  } catch (error) {
    console.error('Error al actualizar dirección:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar dirección' });
  }
};

/**
 * Eliminar dirección de la agenda (soft delete)
 */
const deleteDireccion = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.direccionAgenda.findFirst({
      where: { id: parseInt(id), usuarioId: req.user.id, activo: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Dirección no encontrada' });
    }

    await prisma.direccionAgenda.update({
      where: { id: parseInt(id) },
      data: { activo: false },
    });

    res.json({ success: true, message: 'Dirección eliminada' });
  } catch (error) {
    console.error('Error al eliminar dirección:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar dirección' });
  }
};

module.exports = { getAgenda, createDireccion, updateDireccion, deleteDireccion };
