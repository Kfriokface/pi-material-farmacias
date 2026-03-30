const prisma = require('../lib/prisma');

/**
 * Obtener configuración del sistema
 * Todos los roles autenticados pueden leerla (necesitan saber los límites)
 */
const getConfiguracion = async (req, res) => {
  try {
    let config = await prisma.configuracion.findUnique({ where: { id: 1 } });

    // Si no existe aún, crearla con valores por defecto
    if (!config) {
      config = await prisma.configuracion.create({ data: { id: 1 } });
    }

    res.json({ success: true, data: config });
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuración',
      error: error.message,
    });
  }
};

/**
 * Actualizar configuración del sistema — solo ADMIN
 */
const updateConfiguracion = async (req, res) => {
  try {
    const {
      limiteAnualPorFarmacia,
      soporteNombre,
      soporteEmail,
      soporteTelefono,
      appNombre,
      avisoActivo,
      avisoTexto,
      emailAdmin,
      entregaDefaultDireccion,
      entregaDefaultCodigoPostal,
      entregaDefaultLocalidad,
      entregaDefaultProvincia,
    } = req.body;

    // Construir objeto de actualización solo con los campos que vienen
    const data = {};
    if (limiteAnualPorFarmacia       !== undefined) data.limiteAnualPorFarmacia       = limiteAnualPorFarmacia;
    if (soporteNombre                !== undefined) data.soporteNombre                = soporteNombre;
    if (soporteEmail                 !== undefined) data.soporteEmail                 = soporteEmail;
    if (soporteTelefono              !== undefined) data.soporteTelefono              = soporteTelefono;
    if (appNombre                    !== undefined) data.appNombre                    = appNombre;
    if (avisoActivo                  !== undefined) data.avisoActivo                  = avisoActivo;
    if (avisoTexto                   !== undefined) data.avisoTexto                   = avisoTexto;
    if (emailAdmin                   !== undefined) data.emailAdmin                   = emailAdmin;
    if (entregaDefaultDireccion      !== undefined) data.entregaDefaultDireccion      = entregaDefaultDireccion;
    if (entregaDefaultCodigoPostal   !== undefined) data.entregaDefaultCodigoPostal   = entregaDefaultCodigoPostal;
    if (entregaDefaultLocalidad      !== undefined) data.entregaDefaultLocalidad      = entregaDefaultLocalidad;
    if (entregaDefaultProvincia      !== undefined) data.entregaDefaultProvincia      = entregaDefaultProvincia;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay datos para actualizar',
      });
    }

    const config = await prisma.configuracion.upsert({
      where:  { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });

    res.json({
      success: true,
      message: 'Configuración actualizada exitosamente',
      data: config,
    });
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar configuración',
      error: error.message,
    });
  }
};

module.exports = {
  getConfiguracion,
  updateConfiguracion,
};
