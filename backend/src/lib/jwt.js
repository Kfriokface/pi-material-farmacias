const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_this';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

/**
 * Genera un token JWT para un usuario
 * @param {Object} user - Usuario de la BD
 * @returns {String} Token JWT
 */
function generateToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    rol: user.rol,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
}

/**
 * Verifica y decodifica un token JWT
 * @param {String} token - Token JWT
 * @returns {Object} Payload decodificado
 * @throws {Error} Si el token es inválido o expirado
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
}

module.exports = {
  generateToken,
  verifyToken,
};