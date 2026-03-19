const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const multerErrorHandler = require('../middleware/multerErrorHandler');

const {
  upload,
  uploadImagenPrincipal,
  uploadImagenGaleria,
  deleteImagenGaleria,
  deleteImagenPrincipal,
} = require('../controllers/imagenMaterialController');

router.post('/:id/imagen', authenticate, authorize('ADMIN'), upload.single('imagen'), multerErrorHandler, uploadImagenPrincipal);
router.delete('/:id/imagen', authenticate, authorize('ADMIN'), deleteImagenPrincipal);
router.post('/:id/galeria', authenticate, authorize('ADMIN'), upload.single('imagen'), multerErrorHandler, uploadImagenGaleria);
router.delete('/:id/galeria/:filename', authenticate, authorize('ADMIN'), deleteImagenGaleria);

module.exports = router;

// ============================================
// SWAGGER
// ============================================

/**
 * @openapi
 * /api/materiales/{id}/imagen:
 *   post:
 *     summary: Subir imagen principal del material (solo ADMIN)
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [imagen]
 *             properties:
 *               imagen:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Imagen principal y thumbnail actualizados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:      { type: boolean, example: true }
 *                 message:      { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     imagen:       { type: string }
 *                     imagenUrl:    { type: string }
 *                     thumbnail:    { type: string }
 *                     thumbnailUrl: { type: string }
 *       400:
 *         description: No se proporcionó imagen
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Material no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *
 *   delete:
 *     summary: Eliminar imagen principal y thumbnail (solo ADMIN)
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
 *         description: Imagen y thumbnail eliminados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *       404:
 *         description: Material o imagen no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/materiales/{id}/galeria:
 *   post:
 *     summary: Añadir imagen a la galería del material — máx. 5 (solo ADMIN)
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [imagen]
 *             properties:
 *               imagen:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Imagen añadida a la galería
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:       { type: boolean, example: true }
 *                 message:       { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     imagen:        { type: string }
 *                     imagenUrl:     { type: string }
 *                     totalImagenes: { type: integer }
 *                     maxImagenes:   { type: integer, example: 5 }
 *       400:
 *         description: Galería llena o sin imagen
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Material no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/materiales/{id}/galeria/{filename}:
 *   delete:
 *     summary: Eliminar imagen de la galería (solo ADMIN)
 *     tags: [Materiales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: filename
 *         required: true
 *         schema: { type: string }
 *         description: Nombre del archivo (ej. galeria-abc123.webp)
 *     responses:
 *       200:
 *         description: Imagen eliminada de la galería
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:       { type: boolean, example: true }
 *                 message:       { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalImagenes: { type: integer }
 *       404:
 *         description: Material o imagen no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */