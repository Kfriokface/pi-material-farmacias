const express  = require('express');
const router   = express.Router();
const { body, param } = require('express-validator');

const authenticate           = require('../middleware/authenticate');
const authorize              = require('../middleware/authorize');
const filterActivo           = require('../middleware/filterActivo');
const handleValidationErrors = require('../middleware/validation');

const {
  getAllGerencias,
  getGerenciaById,
  createGerencia,
  updateGerencia,
} = require('../controllers/gerenciaController');

const createValidation = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio').isLength({ max: 200 }),
  body('zonaIds').optional().isArray().withMessage('zonaIds debe ser un array'),
];

const updateValidation = [
  param('id').isInt({ min: 1 }).toInt(),
  body('nombre').optional().isLength({ max: 200 }),
  body('activo').optional().isBoolean().toBoolean(),
  body('zonaIds').optional().isArray().withMessage('zonaIds debe ser un array'),
];

router.get('/',    authenticate, filterActivo, getAllGerencias);
router.get('/:id', authenticate, filterActivo, param('id').isInt({ min: 1 }).toInt(), handleValidationErrors, getGerenciaById);
router.post('/',   authenticate, authorize('ADMIN'), createValidation, handleValidationErrors, createGerencia);
router.put('/:id', authenticate, authorize('ADMIN'), updateValidation, handleValidationErrors, updateGerencia);

module.exports = router;

// ============================================
// SWAGGER
// ============================================

/**
 * @openapi
 * tags:
 *   name: Gerencias
 *   description: Gestión de gerencias (agrupan zonas)
 *
 * components:
 *   schemas:
 *     Gerencia:
 *       type: object
 *       properties:
 *         id:           { type: integer, example: 1 }
 *         nombre:       { type: string, example: "Gerencia Centro" }
 *         descripcion:  { type: string }
 *         direccion:    { type: string }
 *         codigoPostal: { type: string }
 *         localidad:    { type: string }
 *         provincia:    { type: string }
 *         activo:       { type: boolean, example: true }
 *         zonas:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               zona:
 *                 type: object
 *                 properties:
 *                   id:     { type: integer }
 *                   nombre: { type: string }
 *         _count:
 *           type: object
 *           properties:
 *             zonas: { type: integer, example: 2 }
 */

/**
 * @openapi
 * /api/gerencias:
 *   get:
 *     summary: Listar gerencias (incluye zonas)
 *     tags: [Gerencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: activo
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Lista de gerencias
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Gerencia' }
 *
 *   post:
 *     summary: Crear gerencia (solo ADMIN)
 *     tags: [Gerencias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre:       { type: string, example: "Gerencia Sur" }
 *               descripcion:  { type: string }
 *               direccion:    { type: string }
 *               codigoPostal: { type: string }
 *               localidad:    { type: string }
 *               provincia:    { type: string }
 *               zonaIds:
 *                 type: array
 *                 items: { type: integer }
 *                 example: [1, 2]
 *     responses:
 *       201:
 *         description: Gerencia creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Gerencia' }
 *       400:
 *         description: Nombre duplicado o datos inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/gerencias/{id}:
 *   get:
 *     summary: Obtener gerencia por ID
 *     tags: [Gerencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Gerencia encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Gerencia' }
 *       404:
 *         description: Gerencia no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *
 *   put:
 *     summary: Actualizar gerencia (solo ADMIN)
 *     tags: [Gerencias]
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
 *               nombre:       { type: string }
 *               descripcion:  { type: string }
 *               direccion:    { type: string }
 *               codigoPostal: { type: string }
 *               localidad:    { type: string }
 *               provincia:    { type: string }
 *               activo:       { type: boolean }
 *               zonaIds:
 *                 type: array
 *                 description: Reemplaza todas las zonas asociadas
 *                 items: { type: integer }
 *                 example: [1, 3]
 *     responses:
 *       200:
 *         description: Gerencia actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Gerencia' }
 *       404:
 *         description: Gerencia no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
