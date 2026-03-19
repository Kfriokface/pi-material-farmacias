const { verifyToken } = require('../lib/jwt');
const prisma = require('../lib/prisma');

/**
 * Middleware que verifica si el usuario está autenticado
 * Adjunta req.user si el token es válido
 */
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No se proporcionó token de autenticación',
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    const user = await prisma.usuario.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        nombreCompleto: true,
        nombre: true,
        apellido1: true,
        apellido2: true,
        rol: true,
        avatar: true,
        avatarEntraId: true,
        numeroSAP: true,
        zonaId: true,
        activo: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    if (!user.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario desactivado',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Token inválido',
    });
  }
}

module.exports = authMiddleware;