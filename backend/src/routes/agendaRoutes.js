const express  = require('express');
const router   = express.Router();

const authenticate           = require('../middleware/authenticate');
const handleValidationErrors = require('../middleware/validation');
const { body, param }        = require('express-validator');

const {
  getAgenda,
  createDireccion,
  updateDireccion,
  deleteDireccion,
} = require('../controllers/agendaController');

const direccionValidation = [
  body('nombre').trim().escape().isLength({ min: 1, max: 100 }).withMessage('El nombre es obligatorio (máx. 100 caracteres)'),
  body('direccion').trim().escape().isLength({ min: 3, max: 200 }).withMessage('La dirección es obligatoria (máx. 200 caracteres)'),
  body('codigoPostal').trim().matches(/^\d{5}$/).withMessage('Código postal inválido'),
  body('localidad').trim().escape().isLength({ min: 2, max: 100 }).withMessage('La localidad es obligatoria'),
  body('provincia').trim().escape().isLength({ min: 2, max: 100 }).withMessage('La provincia es obligatoria'),
];

const idValidation = [
  param('id').isInt({ min: 1 }).toInt().withMessage('ID inválido'),
];

router.get('/',     authenticate, getAgenda);
router.post('/',    authenticate, direccionValidation, handleValidationErrors, createDireccion);
router.put('/:id',  authenticate, idValidation, direccionValidation, handleValidationErrors, updateDireccion);
router.delete('/:id', authenticate, idValidation, handleValidationErrors, deleteDireccion);

module.exports = router;

// ============================================
// SWAGGER
// ============================================

/**
 * @openapi
 * tags:
 *   name: Agenda
 *   description: Gestión de la agenda de direcciones de entrega del usuario autenticado
 *
 * components:
 *   schemas:
 *     DireccionAgenda:
 *       type: object
 *       properties:
 *         id:           { type: integer, example: 1 }
 *         nombre:       { type: string, example: "Oficina principal" }
 *         direccion:    { type: string, example: "Calle Mayor, 1" }
 *         codigoPostal: { type: string, example: "28013" }
 *         localidad:    { type: string, example: "Madrid" }
 *         provincia:    { type: string, example: "Madrid" }
 *         activo:       { type: boolean, example: true }
 *         createdAt:    { type: string, format: date-time }
 */

/**
 * @openapi
 * /api/agenda:
 *   get:
 *     summary: Listar direcciones de la agenda del usuario autenticado
 *     tags: [Agenda]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de direcciones de agenda
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/DireccionAgenda' }
 *
 *   post:
 *     summary: Crear dirección en la agenda
 *     tags: [Agenda]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, direccion, codigoPostal, localidad, provincia]
 *             properties:
 *               nombre:       { type: string, example: "Oficina principal" }
 *               direccion:    { type: string, example: "Calle Mayor, 1" }
 *               codigoPostal: { type: string, example: "28013" }
 *               localidad:    { type: string, example: "Madrid" }
 *               provincia:    { type: string, example: "Madrid" }
 *     responses:
 *       201:
 *         description: Dirección creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/DireccionAgenda' }
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/agenda/{id}:
 *   put:
 *     summary: Actualizar dirección de la agenda
 *     tags: [Agenda]
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
 *             required: [nombre, direccion, codigoPostal, localidad, provincia]
 *             properties:
 *               nombre:       { type: string }
 *               direccion:    { type: string }
 *               codigoPostal: { type: string }
 *               localidad:    { type: string }
 *               provincia:    { type: string }
 *     responses:
 *       200:
 *         description: Dirección actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/DireccionAgenda' }
 *       404:
 *         description: Dirección no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *
 *   delete:
 *     summary: Eliminar dirección de la agenda (soft delete)
 *     tags: [Agenda]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Dirección eliminada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *       404:
 *         description: Dirección no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
