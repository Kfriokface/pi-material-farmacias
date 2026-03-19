const express = require('express');
const router  = express.Router();

const authenticate  = require('../middleware/authenticate');
const authorize     = require('../middleware/authorize');
const filterActivo  = require('../middleware/filterActivo');
const handleValidationErrors = require('../middleware/validation');

const {
  createEstablecimiento,
  getAllEstablecimientos,
  getEstablecimientoById,
  updateEstablecimiento,
  deleteEstablecimiento,
} = require('../controllers/establecimientoController');

const {
  createEstablecimientoValidation,
  updateEstablecimientoValidation,
  idValidation,
  listEstablecimientosValidation,
} = require('../validators/establecimientoValidator');

router.get('/', authenticate, filterActivo, listEstablecimientosValidation, handleValidationErrors, getAllEstablecimientos);
router.get('/:id', authenticate, filterActivo, idValidation, handleValidationErrors, getEstablecimientoById);
router.post('/', authenticate, authorize('ADMIN'), createEstablecimientoValidation, handleValidationErrors, createEstablecimiento);
router.put('/:id', authenticate, authorize('ADMIN'), updateEstablecimientoValidation, handleValidationErrors, updateEstablecimiento);
router.delete('/:id', authenticate, authorize('ADMIN'), idValidation, handleValidationErrors, deleteEstablecimiento);

module.exports = router;

// ============================================
// SWAGGER
// ============================================

/**
 * @openapi
 * tags:
 *   name: Establecimientos
 *   description: Gestión de farmacias y clínicas. DELEGADO solo ve sus farmacias asignadas; GERENTE ve farmacias de su zona y sus clínicas; ADMIN ve todo.
 *
 * components:
 *   schemas:
 *     Establecimiento:
 *       type: object
 *       properties:
 *         id:             { type: integer, example: 1 }
 *         tipo:           { type: string, enum: [FARMACIA, CLINICA], example: "FARMACIA" }
 *         nombre:         { type: string, example: "Farmacia García" }
 *         nif:            { type: string, example: "B98765432" }
 *         codigoInterno:  { type: string }
 *         codigoERP:      { type: string }
 *         direccion:      { type: string }
 *         codigoPostal:   { type: string }
 *         localidad:      { type: string }
 *         provincia:      { type: string }
 *         telefono:       { type: string }
 *         lengua:         { type: string, example: "ES" }
 *         sanibrick:      { type: string }
 *         territoryDescr: { type: string }
 *         panel:          { type: string }
 *         ubicacion:      { type: string }
 *         activo:         { type: boolean, example: true }
 *         zonaId:         { type: integer }
 *         delegadoId:     { type: integer }
 *         zona:
 *           type: object
 *           properties:
 *             id:     { type: integer }
 *             nombre: { type: string }
 *         delegado:
 *           type: object
 *           properties:
 *             id:        { type: integer }
 *             nombre:    { type: string }
 *             apellido1: { type: string }
 *             apellido2: { type: string }
 *             email:     { type: string }
 */

/**
 * @openapi
 * /api/establecimientos:
 *   get:
 *     summary: Listar establecimientos (filtrado por rol)
 *     tags: [Establecimientos]
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
 *         name: tipo
 *         schema: { type: string, enum: [FARMACIA, CLINICA] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Filtrar por nombre, NIF, localidad o provincia
 *       - in: query
 *         name: activo
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Lista de establecimientos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Establecimiento' }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *
 *   post:
 *     summary: Crear establecimiento (solo ADMIN)
 *     tags: [Establecimientos]
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
 *               tipo:           { type: string, enum: [FARMACIA, CLINICA], default: FARMACIA }
 *               nombre:         { type: string, example: "Farmacia García" }
 *               nif:            { type: string }
 *               codigoInterno:  { type: string }
 *               codigoERP:      { type: string }
 *               direccion:      { type: string }
 *               codigoPostal:   { type: string }
 *               localidad:      { type: string }
 *               provincia:      { type: string }
 *               telefono:       { type: string }
 *               lengua:         { type: string, default: ES }
 *               sanibrick:      { type: string }
 *               territoryDescr: { type: string }
 *               panel:          { type: string }
 *               ubicacion:      { type: string }
 *               zonaId:         { type: integer }
 *               delegadoId:     { type: integer }
 *     responses:
 *       201:
 *         description: Establecimiento creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Establecimiento' }
 *       400:
 *         description: NIF duplicado, delegado inválido o datos incorrectos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/establecimientos/{id}:
 *   get:
 *     summary: Obtener establecimiento por ID
 *     tags: [Establecimientos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Establecimiento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Establecimiento' }
 *       404:
 *         description: Establecimiento no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *
 *   put:
 *     summary: Actualizar establecimiento (solo ADMIN)
 *     tags: [Establecimientos]
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
 *               tipo:           { type: string, enum: [FARMACIA, CLINICA] }
 *               nombre:         { type: string }
 *               nif:            { type: string }
 *               codigoInterno:  { type: string }
 *               codigoERP:      { type: string }
 *               direccion:      { type: string }
 *               codigoPostal:   { type: string }
 *               localidad:      { type: string }
 *               provincia:      { type: string }
 *               telefono:       { type: string }
 *               lengua:         { type: string }
 *               sanibrick:      { type: string }
 *               territoryDescr: { type: string }
 *               panel:          { type: string }
 *               ubicacion:      { type: string }
 *               zonaId:         { type: integer }
 *               delegadoId:     { type: integer }
 *               activo:         { type: boolean }
 *     responses:
 *       200:
 *         description: Establecimiento actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Establecimiento' }
 *       404:
 *         description: Establecimiento no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *
 *   delete:
 *     summary: Desactivar establecimiento — soft delete (solo ADMIN)
 *     tags: [Establecimientos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Establecimiento desactivado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Establecimiento' }
 *       404:
 *         description: Establecimiento no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */