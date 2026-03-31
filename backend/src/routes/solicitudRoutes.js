const express = require('express');
const router  = express.Router();

const authenticate  = require('../middleware/authenticate');
const authorize     = require('../middleware/authorize');
const handleValidationErrors = require('../middleware/validation');

const {
  createSolicitud,
  getAllSolicitudes,
  getSolicitudById,
  cambiarEstado,
  completarSolicitud,
  getPresupuesto,
  uploadArchivoPersonalizacion,
} = require('../controllers/solicitudController');

const {
  upload,
  uploadFotoInstalacion,
  deleteFotoInstalacion,
} = require('../controllers/fotoInstalacionController');

const { uploadArchivo } = require('../lib/fileHelper');

const multerErrorHandler = require('../middleware/multerErrorHandler');

const {
  createSolicitudValidation,
  cambiarEstadoValidation,
  idValidation,
  listSolicitudesValidation,
} = require('../validators/solicitudValidator');

router.get('/', authenticate, listSolicitudesValidation, handleValidationErrors, getAllSolicitudes);
router.get('/presupuesto', authenticate, getPresupuesto);
router.get('/:id', authenticate, idValidation, handleValidationErrors, getSolicitudById);
router.post('/', authenticate, authorize('ADMIN', 'DELEGADO', 'GERENTE'), createSolicitudValidation, handleValidationErrors, createSolicitud);
router.patch('/:id/estado', authenticate, authorize('ADMIN'), cambiarEstadoValidation, handleValidationErrors, cambiarEstado);
router.patch('/:id/completar', authenticate, authorize('ADMIN', 'DELEGADO', 'GERENTE'), idValidation, handleValidationErrors, completarSolicitud);
router.post('/:id/fotos', authenticate, upload.single('foto'), multerErrorHandler, idValidation, handleValidationErrors, uploadFotoInstalacion);
router.delete('/:id/fotos/:fotoId', authenticate, authorize('ADMIN'), deleteFotoInstalacion);
router.post('/:id/archivos-personalizacion', authenticate, authorize('ADMIN', 'DELEGADO', 'GERENTE'), uploadArchivo.single('archivo'), multerErrorHandler, idValidation, handleValidationErrors, uploadArchivoPersonalizacion);

module.exports = router;

// ============================================
// SWAGGER
// ============================================

/**
 * @openapi
 * tags:
 *   name: Solicitudes
 *   description: |
 *     Gestión de solicitudes de material.
 *     Flujo de estados: PENDIENTE → EN_FABRICACION → COMPLETADA (o RECHAZADA desde PENDIENTE).
 *     DELEGADO solo ve sus solicitudes; GERENTE ve las de su zona; ADMIN ve todas.
 *
 * components:
 *   schemas:
 *     Solicitud:
 *       type: object
 *       properties:
 *         id:                       { type: integer, example: 1 }
 *         estado:                   { type: string, enum: [PENDIENTE, EN_FABRICACION, COMPLETADA, RECHAZADA] }
 *         usuarioId:                { type: integer }
 *         establecimientoId:        { type: integer, nullable: true }
 *         eventoNombre:             { type: string, nullable: true }
 *         materialId:               { type: integer }
 *         importeTotal:             { type: number }
 *         altoCm:                   { type: integer, nullable: true }
 *         anchoCm:                  { type: integer, nullable: true }
 *         orientacion:              { type: string, nullable: true }
 *         personalizarNombre:       { type: boolean }
 *         descripcionPersonalizada: { type: string, nullable: true }
 *         talla:                    { type: string, nullable: true }
 *         personalizacionBata:      { type: string, nullable: true }
 *         marcaId:                  { type: integer, nullable: true }
 *         direccionEntrega:         { type: string, nullable: true }
 *         codigoPostalEntrega:      { type: string, nullable: true }
 *         localidadEntrega:         { type: string, nullable: true }
 *         provinciaEntrega:         { type: string, nullable: true }
 *         telefonoEntrega:          { type: string, nullable: true }
 *         observaciones:            { type: string, nullable: true }
 *         avisoLimiteUsuario:       { type: boolean }
 *         archivosPersonalizacion:  { type: string, nullable: true, description: "JSON array de rutas" }
 *         completadaEn:             { type: string, format: date-time, nullable: true }
 *         rechazadaEn:              { type: string, format: date-time, nullable: true }
 *         createdAt:                { type: string, format: date-time }
 */

/**
 * @openapi
 * /api/solicitudes/presupuesto:
 *   get:
 *     summary: Consultar gasto anual del usuario y si se superaría el límite
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: importe
 *         schema: { type: number }
 *         description: Importe a simular (para comprobar si se superaría el límite)
 *     responses:
 *       200:
 *         description: Estado del presupuesto anual
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     usuario:
 *                       type: object
 *                       properties:
 *                         gastoAnual: { type: number }
 *                         limite:     { type: number, nullable: true }
 *                         superado:   { type: boolean }
 */

/**
 * @openapi
 * /api/solicitudes:
 *   get:
 *     summary: Listar solicitudes (filtrado por rol)
 *     tags: [Solicitudes]
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
 *         name: estado
 *         schema: { type: string, enum: [PENDIENTE, EN_FABRICACION, COMPLETADA, RECHAZADA] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Filtrar por nombre de establecimiento, material o usuario
 *     responses:
 *       200:
 *         description: Lista de solicitudes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Solicitud' }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *
 *   post:
 *     summary: Crear solicitud (ADMIN, GERENTE o DELEGADO)
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [materialId]
 *             properties:
 *               materialId:               { type: integer }
 *               establecimientoId:        { type: integer, description: "Obligatorio si no es evento" }
 *               eventoNombre:             { type: string, description: "Obligatorio si es evento (sin establecimientoId)" }
 *               altoCm:                   { type: integer }
 *               anchoCm:                  { type: integer }
 *               orientacion:              { type: string }
 *               personalizarNombre:       { type: boolean, default: false }
 *               descripcionPersonalizada: { type: string }
 *               talla:                    { type: string }
 *               personalizacionBata:      { type: string }
 *               marcaId:                  { type: integer }
 *               direccionEntrega:         { type: string }
 *               codigoPostalEntrega:      { type: string }
 *               localidadEntrega:         { type: string }
 *               provinciaEntrega:         { type: string }
 *               telefonoEntrega:          { type: string }
 *               observaciones:            { type: string }
 *     responses:
 *       201:
 *         description: Solicitud creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Solicitud' }
 *       400:
 *         description: Material/establecimiento no encontrado o validación fallida
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Sin permisos para este establecimiento o tipo de solicitud
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/solicitudes/{id}:
 *   get:
 *     summary: Obtener solicitud por ID
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Solicitud encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Solicitud' }
 *       404:
 *         description: Solicitud no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/solicitudes/{id}/estado:
 *   patch:
 *     summary: Cambiar estado de solicitud (solo ADMIN)
 *     description: |
 *       Transiciones permitidas:
 *       - PENDIENTE → EN_FABRICACION (fija dirección entrega, asigna proveedor y genera token fabricante)
 *       - PENDIENTE → RECHAZADA
 *     tags: [Solicitudes]
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
 *             required: [estado]
 *             properties:
 *               estado:           { type: string, enum: [EN_FABRICACION, RECHAZADA] }
 *               observaciones:    { type: string }
 *               proveedorEnviadoId: { type: integer, description: "Si no se indica, se usa el proveedor del material" }
 *     responses:
 *       200:
 *         description: Estado actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Solicitud' }
 *       400:
 *         description: Transición no permitida
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Solicitud no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/solicitudes/{id}/completar:
 *   patch:
 *     summary: Completar solicitud (ADMIN, GERENTE o DELEGADO propietario)
 *     description: Solo válido desde estado EN_FABRICACION.
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Solicitud completada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Solicitud' }
 *       400:
 *         description: Estado no permite completar
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Solicitud no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/solicitudes/{id}/fotos:
 *   post:
 *     summary: Subir foto de instalación a una solicitud
 *     tags: [Solicitudes]
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
 *             required: [foto]
 *             properties:
 *               foto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Foto subida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *       404:
 *         description: Solicitud no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/solicitudes/{id}/fotos/{fotoId}:
 *   delete:
 *     summary: Eliminar foto de instalación (solo ADMIN)
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: fotoId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Foto eliminada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *       404:
 *         description: Foto no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/solicitudes/{id}/archivos-personalizacion:
 *   post:
 *     summary: Subir archivo de personalización (imagen o PDF, máx. 5 por solicitud)
 *     tags: [Solicitudes]
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
 *             required: [archivo]
 *             properties:
 *               archivo:
 *                 type: string
 *                 format: binary
 *                 description: Imagen (convertida a WebP) o PDF
 *     responses:
 *       200:
 *         description: Archivo subido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:                      { type: integer }
 *                     archivosPersonalizacion: { type: array, items: { type: string } }
 *       400:
 *         description: Sin archivo o límite de 5 alcanzado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Solicitud no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */