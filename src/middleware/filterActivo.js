/**
 * Middleware que filtra entidades activas según el rol del usuario
 * - DELEGADO: solo ve registros activos
 * - ADMIN: ve todo, puede filtrar por ?activo=true/false
 * 
 * Añade req.filterActivo al request para usarlo en los controladores
 */
const filterActivo = (req, res, next) => {
  if (req.user.rol === 'DELEGADO') {
    req.filterActivo = { activo: true };
  } else if (req.query.activo !== undefined) {
    req.filterActivo = { activo: req.query.activo === 'true' };
  } else {
    req.filterActivo = {};
  }

  next();
};

module.exports = filterActivo;