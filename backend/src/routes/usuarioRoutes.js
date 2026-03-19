const express  = require('express');
const router   = express.Router();

const authenticate           = require('../middleware/authenticate');
const authorize              = require('../middleware/authorize');
const filterActivo           = require('../middleware/filterActivo');
const handleValidationErrors = require('../middleware/validation');

const {
  getAllUsuarios,
  getUsuarioById,
  updateUsuario,
  deleteUsuario,
} = require('../controllers/usuarioController');

const {
  updateUsuarioValidation,
  idValidation,
  listUsuariosValidation,
} = require('../validators/usuarioValidator');

// Listado — solo ADMIN
router.get('/',
  authenticate,
  authorize('ADMIN'),
  filterActivo,
  listUsuariosValidation,
  handleValidationErrors,
  getAllUsuarios
);

// Ver usuario por ID — ADMIN puede ver cualquiera, el propio usuario puede verse a sí mismo
router.get('/:id',
  authenticate,
  filterActivo,
  idValidation,
  handleValidationErrors,
  (req, res, next) => {
    // req.params.id ya es Int por el toInt() del validator
    if (req.user.rol === 'ADMIN' || req.user.id === parseInt(req.params.id)) return next();
    return res.status(403).json({
      success: false,
      message: 'No tienes permisos para ver este usuario',
    });
  },
  getUsuarioById
);

router.put('/:id',
  authenticate,
  authorize('ADMIN'),
  updateUsuarioValidation,
  handleValidationErrors,
  updateUsuario
);

router.delete('/:id',
  authenticate,
  authorize('ADMIN'),
  idValidation,
  handleValidationErrors,
  deleteUsuario
);

module.exports = router;

// ============================================
// SWAGGER
// ============================================

/**
 * @openapi
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios (solo ADMIN)
 */

/**
 * @openapi
 * /api/usuarios:
 *   get:
 *     summary: Listar usuarios (solo ADMIN)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Filtrar por nombre, apellidos o email
 *       - in: query
 *         name: rol
 *         schema: { type: string, enum: [ADMIN, GERENTE, DELEGADO] }
 *       - in: query
 *         name: zonaId
 *         schema: { type: integer }
 *       - in: query
 *         name: activo
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Usuario' }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *       403:
 *         description: Sin permisos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener usuario por ID (ADMIN o propio usuario)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Usuario' }
 *       403:
 *         description: Sin permisos para ver este usuario
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *
 *   put:
 *     summary: Actualizar usuario (solo ADMIN)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:        { type: string }
 *               apellido1:     { type: string }
 *               apellido2:     { type: string }
 *               rol:           { type: string, enum: [ADMIN, GERENTE, DELEGADO] }
 *               zonaId:        { type: integer }
 *               numeroSAP:     { type: string }
 *               direccion:     { type: string }
 *               codigoPostal:  { type: string }
 *               localidad:     { type: string }
 *               provincia:     { type: string }
 *               telefono:      { type: string }
 *               nif:           { type: string }
 *               destMercancia: { type: string }
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Usuario' }
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *
 *   delete:
 *     summary: Desactivar usuario — soft delete (solo ADMIN)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Usuario desactivado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Usuario' }
 *       400:
 *         description: No puedes desactivar tu propio usuario
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */