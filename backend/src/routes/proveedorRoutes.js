const express  = require('express');
const router   = express.Router();

const authenticate           = require('../middleware/authenticate');
const authorize              = require('../middleware/authorize');
const filterActivo           = require('../middleware/filterActivo');
const handleValidationErrors = require('../middleware/validation');

const {
  createProveedorValidation,
  updateProveedorValidation,
  listProveedorValidation,
} = require('../validators/proveedorValidator');

const {
  getAllProveedores,
  getProveedorById,
  createProveedor,
  updateProveedor,
  deleteProveedor,
} = require('../controllers/proveedorController');

router.get('/', authenticate, filterActivo, listProveedorValidation, handleValidationErrors, getAllProveedores);
router.get('/:id', authenticate, filterActivo, getProveedorById);
router.post('/', authenticate, authorize('ADMIN'), createProveedorValidation, handleValidationErrors, createProveedor);
router.put('/:id', authenticate, authorize('ADMIN'), updateProveedorValidation, handleValidationErrors, updateProveedor);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteProveedor);

module.exports = router;

// ============================================
// SWAGGER
// ============================================

/**
 * @openapi
 * tags:
 *   name: Proveedores
 *   description: Gestión de proveedores de materiales
 *
 * components:
 *   schemas:
 *     ProveedorEmail:
 *       type: object
 *       properties:
 *         id:    { type: integer, example: 1 }
 *         email: { type: string, example: "pedidos@proveedor.com" }
 *         tipo:  { type: string, enum: [DEFAULT, PEDIDOS, FACTURAS], example: "DEFAULT" }
 *     Proveedor:
 *       type: object
 *       properties:
 *         id:            { type: integer, example: 1 }
 *         nombre:        { type: string, example: "Imprenta López" }
 *         nif:           { type: string, example: "B12345678" }
 *         direccion:     { type: string }
 *         codigoPostal:  { type: string }
 *         localidad:     { type: string }
 *         telefono:      { type: string }
 *         contacto:      { type: string }
 *         observaciones: { type: string }
 *         activo:        { type: boolean, example: true }
 *         emails:
 *           type: array
 *           items: { $ref: '#/components/schemas/ProveedorEmail' }
 *         _count:
 *           type: object
 *           properties:
 *             materiales: { type: integer, example: 4 }
 */

/**
 * @openapi
 * /api/proveedores:
 *   get:
 *     summary: Listar proveedores
 *     tags: [Proveedores]
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
 *         description: Filtrar por nombre, NIF, contacto, localidad o email
 *       - in: query
 *         name: activo
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Lista de proveedores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Proveedor' }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *
 *   post:
 *     summary: Crear proveedor (solo ADMIN)
 *     tags: [Proveedores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, nif, emails]
 *             properties:
 *               nombre:        { type: string, example: "Imprenta López" }
 *               nif:           { type: string, example: "B12345678" }
 *               direccion:     { type: string }
 *               codigoPostal:  { type: string }
 *               localidad:     { type: string }
 *               telefono:      { type: string }
 *               contacto:      { type: string }
 *               observaciones: { type: string }
 *               emails:
 *                 type: array
 *                 description: Debe incluir al menos uno con tipo DEFAULT
 *                 items:
 *                   type: object
 *                   required: [email, tipo]
 *                   properties:
 *                     email: { type: string }
 *                     tipo:  { type: string, enum: [DEFAULT, PEDIDOS, FACTURAS] }
 *                 example:
 *                   - email: "pedidos@proveedor.com"
 *                     tipo: "DEFAULT"
 *     responses:
 *       201:
 *         description: Proveedor creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Proveedor' }
 *       400:
 *         description: NIF duplicado, sin email DEFAULT o datos inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/proveedores/{id}:
 *   get:
 *     summary: Obtener proveedor por ID (incluye materiales)
 *     tags: [Proveedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Proveedor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Proveedor' }
 *       404:
 *         description: Proveedor no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *
 *   put:
 *     summary: Actualizar proveedor (solo ADMIN)
 *     tags: [Proveedores]
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
 *               nif:           { type: string }
 *               direccion:     { type: string }
 *               codigoPostal:  { type: string }
 *               localidad:     { type: string }
 *               telefono:      { type: string }
 *               contacto:      { type: string }
 *               observaciones: { type: string }
 *               emails:
 *                 type: array
 *                 description: Si se envía, reemplaza todos los emails existentes
 *                 items:
 *                   type: object
 *                   properties:
 *                     email: { type: string }
 *                     tipo:  { type: string, enum: [DEFAULT, PEDIDOS, FACTURAS] }
 *     responses:
 *       200:
 *         description: Proveedor actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Proveedor' }
 *       404:
 *         description: Proveedor no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *
 *   delete:
 *     summary: Desactivar proveedor — soft delete (solo ADMIN)
 *     tags: [Proveedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Proveedor desactivado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Proveedor' }
 *       404:
 *         description: Proveedor no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */