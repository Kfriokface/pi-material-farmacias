const express  = require('express');
const router   = express.Router();

const authenticate           = require('../middleware/authenticate');
const authorize              = require('../middleware/authorize');
const filterActivo           = require('../middleware/filterActivo');
const handleValidationErrors = require('../middleware/validation');

const {
  createMarcaValidation,
  updateMarcaValidation,
  listMarcaValidation,
} = require('../validators/marcaValidator');

const {
  createMarca,
  getAllMarcas,
  getMarcaById,
  updateMarca,
  deleteMarca,
} = require('../controllers/marcaController');

router.get('/', authenticate, filterActivo, listMarcaValidation, handleValidationErrors, getAllMarcas);
router.get('/:id', authenticate, filterActivo, getMarcaById);
router.post('/', authenticate, authorize('ADMIN'), createMarcaValidation, handleValidationErrors, createMarca);
router.put('/:id', authenticate, authorize('ADMIN'), updateMarcaValidation, handleValidationErrors, updateMarca);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteMarca);

module.exports = router;

// ============================================
// SWAGGER
// ============================================

/**
 * @openapi
 * tags:
 *   name: Marcas
 *   description: Gestión de marcas de materiales
 *
 * components:
 *   schemas:
 *     Marca:
 *       type: object
 *       properties:
 *         id:     { type: integer, example: 1 }
 *         nombre: { type: string, example: "3M" }
 *         activo: { type: boolean, example: true }
 *         _count:
 *           type: object
 *           properties:
 *             materiales: { type: integer, example: 5 }
 */

/**
 * @openapi
 * /api/marcas:
 *   get:
 *     summary: Listar marcas
 *     tags: [Marcas]
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
 *         description: Filtrar por nombre
 *       - in: query
 *         name: activo
 *         schema: { type: boolean }
 *         description: Filtrar por estado activo/inactivo
 *     responses:
 *       200:
 *         description: Lista de marcas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Marca' }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *
 *   post:
 *     summary: Crear marca (solo ADMIN)
 *     tags: [Marcas]
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
 *               nombre: { type: string, example: "3M" }
 *               activo: { type: boolean, default: true }
 *     responses:
 *       201:
 *         description: Marca creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Marca' }
 *       400:
 *         description: Nombre duplicado o validación fallida
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/marcas/{id}:
 *   get:
 *     summary: Obtener una marca por ID
 *     tags: [Marcas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Marca encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Marca' }
 *       404:
 *         description: Marca no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *
 *   put:
 *     summary: Actualizar marca (solo ADMIN)
 *     tags: [Marcas]
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
 *               nombre: { type: string }
 *               activo: { type: boolean }
 *     responses:
 *       200:
 *         description: Marca actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Marca' }
 *       404:
 *         description: Marca no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *
 *   delete:
 *     summary: Desactivar marca — soft delete (solo ADMIN)
 *     tags: [Marcas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Marca desactivada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Marca' }
 *       404:
 *         description: Marca no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
