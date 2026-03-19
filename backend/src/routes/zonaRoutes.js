const express  = require('express');
const router   = express.Router();

const authenticate           = require('../middleware/authenticate');
const authorize              = require('../middleware/authorize');
const filterActivo           = require('../middleware/filterActivo');
const handleValidationErrors = require('../middleware/validation');

const {
  createZonaValidation,
  updateZonaValidation,
  listZonaValidation,
} = require('../validators/zonaValidator');

const {
  getAllZonas,
  getZonaById,
  createZona,
  updateZona,
} = require('../controllers/zonaController');

router.get('/', authenticate, filterActivo, listZonaValidation, handleValidationErrors, getAllZonas);
router.get('/:id', authenticate, filterActivo, getZonaById);
router.post('/', authenticate, authorize('ADMIN'), createZonaValidation, handleValidationErrors, createZona);
router.put('/:id', authenticate, authorize('ADMIN'), updateZonaValidation, handleValidationErrors, updateZona);

module.exports = router;

// ============================================
// SWAGGER
// ============================================

/**
 * @openapi
 * tags:
 *   name: Zonas
 *   description: Gestión de zonas geográficas
 *
 * components:
 *   schemas:
 *     Zona:
 *       type: object
 *       properties:
 *         id:           { type: integer, example: 1 }
 *         nombre:       { type: string, example: "Madrid Centro" }
 *         direccion:    { type: string }
 *         codigoPostal: { type: string }
 *         localidad:    { type: string }
 *         activo:       { type: boolean, example: true }
 *         _count:
 *           type: object
 *           properties:
 *             usuarios: { type: integer, example: 3 }
 */

/**
 * @openapi
 * /api/zonas:
 *   get:
 *     summary: Listar zonas
 *     tags: [Zonas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Filtrar por nombre, descripción o localidad
 *       - in: query
 *         name: activo
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Lista de zonas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Zona' }
 *
 *   post:
 *     summary: Crear zona (solo ADMIN)
 *     tags: [Zonas]
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
 *               nombre:       { type: string, example: "Madrid Centro" }
 *               direccion:    { type: string }
 *               codigoPostal: { type: string }
 *               localidad:    { type: string }
 *     responses:
 *       201:
 *         description: Zona creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Zona' }
 *       400:
 *         description: Nombre duplicado o datos inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/zonas/{id}:
 *   get:
 *     summary: Obtener zona por ID (incluye usuarios)
 *     tags: [Zonas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Zona encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Zona' }
 *       404:
 *         description: Zona no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *
 *   put:
 *     summary: Actualizar zona (solo ADMIN)
 *     tags: [Zonas]
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
 *               direccion:    { type: string }
 *               codigoPostal: { type: string }
 *               localidad:    { type: string }
 *               activo:       { type: boolean }
 *     responses:
 *       200:
 *         description: Zona actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Zona' }
 *       404:
 *         description: Zona no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */