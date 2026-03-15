/**
 * Middleware de autorización por roles con jerarquía:
 *   ADMIN > GERENTE > DELEGADO
 *
 * Si una ruta permite 'DELEGADO', también se permite a GERENTE y ADMIN.
 * Si una ruta permite 'GERENTE', también se permite a ADMIN.
 *
 * @param {...string} allowedRoles - Roles mínimos requeridos
 * @example
 * router.delete('/materiales/:id', authenticate, authorize('ADMIN'), deleteMaterial);
 * router.post('/solicitudes', authenticate, authorize('DELEGADO'), createSolicitud);
 */
const ROLE_LEVELS = { DELEGADO: 0, GERENTE: 1, ADMIN: 2 };

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
    }

    const userLevel = ROLE_LEVELS[req.user.rol] ?? -1;
    const minRequired = Math.min(...allowedRoles.map(r => ROLE_LEVELS[r] ?? Infinity));

    if (userLevel < minRequired) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción',
        requiredRoles: allowedRoles,
        yourRole: req.user.rol,
      });
    }

    next();
  };
}

module.exports = authorize;
