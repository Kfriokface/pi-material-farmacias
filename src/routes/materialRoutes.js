const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const filterActivo = require('../middleware/filterActivo');
const handleValidationErrors = require('../middleware/validation');

const {
  createMaterial,
  getAllMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
} = require('../controllers/materialController');

const {
  createMaterialValidation,
  updateMaterialValidation,
  idValidation,
  listMaterialsValidation,
} = require('../validators/materialValidator');

router.get('/', authenticate, filterActivo, listMaterialsValidation, handleValidationErrors, getAllMaterials);
router.get('/:id', authenticate, filterActivo, idValidation, handleValidationErrors, getMaterialById);
router.post('/', authenticate, authorize('ADMIN'), createMaterialValidation, handleValidationErrors, createMaterial);
router.put('/:id', authenticate, authorize('ADMIN'), updateMaterialValidation, handleValidationErrors, updateMaterial);
router.delete('/:id', authenticate, authorize('ADMIN'), idValidation, handleValidationErrors, deleteMaterial);

module.exports = router;

// ============================================
// SWAGGER
// ============================================

/**
 * @openapi
 * tags:
 *   name: Materiales
 *   description: Catálogo de materiales promocionales. DELEGADO solo ve materiales visibles para delegados y de tipo FARMACIA.
 *
 * components:
 *   schemas:
 *     Material:
 *       type: object
 *       properties:
 *         id:                        { type: integer, example: 1 }
 *         codigo:                    { type: string, example: "MAT-1" }
 *         nombre:                    { type: string, example: "Vinilo escaparate" }
 *         descripcion:               { type: string }
 *         precio:                    { type: number, example: 25.50 }
 *         precioPublico:             { type: number }
 *         tipoPrecio:                { type: string, enum: [UNIDAD, METRO2], example: "UNIDAD" }
 *         imagen:                    { type: string, example: "materiales/principales/foto.webp" }
 *         thumbnail:                 { type: string }
 *         permiteAltoAncho:          { type: boolean, example: false }
 *         permitePersonalizar:       { type: boolean, example: false }
 *         requiereNombreFarmacia:    { type: boolean, example: false }
 *         permiteTalla:              { type: boolean, example: false }
 *         permitePersonalizacionBata: { type: boolean, example: false }
 *         visibleParaDelegado:       { type: boolean, example: true }
 *         tipoEstablecimiento:       { type: string, enum: [FARMACIA, CLINICA], nullable: true }
 *         permiteEvento:             { type: boolean, example: false }
 *         permiteMarca:              { type: boolean, example: false }
 *         activo:                    { type: boolean, example: true }
 *         marcaId:                   { type: integer }
 *         proveedorId:               { type: integer }
 *         marca:
 *           type: object
 *           properties:
 *             id:     { type: integer }
 *             nombre: { type: string }
 *         proveedor:
 *           type: object
 *           properties:
 *             id:       { type: integer }
 *             nombre:   { type: string }
 *             contacto: { type: string }
 */

/**
 * @openapi
 * /api/materiales:
 *   get:
 *     summary: Listar materiales (filtrado por rol)
 *     tags: [Materiales]
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
 *         description: Filtrar por nombre, descripción, marca o proveedor
 *       - in: query
 *         name: proveedorId
 *         schema: { type: integer }
 *       - in: query
 *         name: tipoEstablecimiento
 *         schema: { type: string, enum: [FARMACIA, CLINICA, EVENTO] }
 *       - in: query
 *         name: activo
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Lista de materiales
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Material' }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *
 *   post:
 *     summary: Crear material (solo ADMIN)
 *     tags: [Materiales]
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
 *               nombre:                    { type: string, example: "Vinilo escaparate" }
 *               descripcion:               { type: string }
 *               marcaId:                   { type: integer }
 *               proveedorId:               { type: integer }
 *               precio:                    { type: number }
 *               precioPublico:             { type: number }
 *               tipoPrecio:                { type: string, enum: [UNIDAD, METRO2], default: UNIDAD }
 *               permiteAltoAncho:          { type: boolean, default: false }
 *               permitePersonalizar:       { type: boolean, default: false }
 *               requiereNombreFarmacia:    { type: boolean, default: false }
 *               permiteTalla:              { type: boolean, default: false }
 *               permitePersonalizacionBata: { type: boolean, default: false }
 *               visibleParaDelegado:       { type: boolean, default: true }
 *               tipoEstablecimiento:       { type: string, enum: [FARMACIA, CLINICA] }
 *               permiteEvento:             { type: boolean, default: false }
 *               permiteMarca:              { type: boolean, default: false }
 *               activo:                    { type: boolean, default: true }
 *     responses:
 *       201:
 *         description: Material creado (código MAT-{id} asignado automáticamente)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Material' }
 *       400:
 *         description: Marca o proveedor no existen
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/materiales/{id}:
 *   get:
 *     summary: Obtener material por ID
 *     tags: [Materiales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Material encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Material' }
 *       404:
 *         description: Material no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *
 *   put:
 *     summary: Actualizar material (solo ADMIN)
 *     tags: [Materiales]
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
 *               nombre:                    { type: string }
 *               descripcion:               { type: string }
 *               marcaId:                   { type: integer }
 *               proveedorId:               { type: integer }
 *               precio:                    { type: number }
 *               precioPublico:             { type: number }
 *               tipoPrecio:                { type: string, enum: [UNIDAD, METRO2] }
 *               permiteAltoAncho:          { type: boolean }
 *               permitePersonalizar:       { type: boolean }
 *               requiereNombreFarmacia:    { type: boolean }
 *               permiteTalla:              { type: boolean }
 *               permitePersonalizacionBata: { type: boolean }
 *               visibleParaDelegado:       { type: boolean }
 *               tipoEstablecimiento:       { type: string, enum: [FARMACIA, CLINICA] }
 *               permiteEvento:             { type: boolean }
 *               permiteMarca:              { type: boolean }
 *               activo:                    { type: boolean }
 *     responses:
 *       200:
 *         description: Material actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Material' }
 *       404:
 *         description: Material no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *
 *   delete:
 *     summary: Desactivar material — soft delete (solo ADMIN)
 *     tags: [Materiales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Material desactivado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Material' }
 *       404:
 *         description: Material no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */