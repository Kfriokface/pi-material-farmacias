const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const { upload } = require('../lib/fileHelper');
const multerErrorHandler = require('../middleware/multerErrorHandler');

// Rutas públicas (no requieren autenticación)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rutas protegidas (requieren autenticación)
router.get('/me', authenticate, authController.me);
router.patch('/profile', authenticate, authController.updateProfile);
router.patch('/avatar', authenticate, upload.single('avatar'), multerErrorHandler, authController.uploadAvatar); // NUEVO

module.exports = router;

// ============================================
// SWAGGER
// ============================================

/**
 * @openapi
 * tags:
 *   name: Auth
 *   description: Autenticación y gestión del perfil propio
 *
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         id:             { type: integer, example: 1 }
 *         email:          { type: string, example: "admin@farmacias.com" }
 *         nombreCompleto: { type: string, example: "Ana García López" }
 *         nombre:         { type: string, example: "Ana" }
 *         apellido1:      { type: string, example: "García" }
 *         apellido2:      { type: string, example: "López" }
 *         rol:            { type: string, enum: [ADMIN, GERENTE, DELEGADO] }
 *         zonaId:         { type: integer, example: 1 }
 *         zona:
 *           type: object
 *           properties:
 *             id:     { type: integer }
 *             nombre: { type: string }
 *         numeroSAP:    { type: string, example: "SAP001" }
 *         direccion:    { type: string }
 *         codigoPostal: { type: string }
 *         localidad:    { type: string }
 *         avatar:       { type: string, example: "avatars/foto.jpg" }
 *         activo:       { type: boolean, example: true }
 */

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, example: "admin@farmacias.com" }
 *               password: { type: string, example: "password123" }
 *     responses:
 *       200:
 *         description: Login correcto — devuelve token JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 token:   { type: string }
 *                 user:    { $ref: '#/components/schemas/Usuario' }
 *       401:
 *         description: Credenciales inválidas o usuario desactivado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Registrar usuario (solo desarrollo)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:     { type: string, example: "nuevo@farmacias.com" }
 *               password:  { type: string, example: "password123" }
 *               nombre:    { type: string }
 *               apellido1: { type: string }
 *               apellido2: { type: string }
 *               rol:       { type: string, enum: [ADMIN, GERENTE, DELEGADO], default: DELEGADO }
 *     responses:
 *       201:
 *         description: Usuario creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 user:    { $ref: '#/components/schemas/Usuario' }
 *       400:
 *         description: Email ya registrado o datos inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Obtener usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario en sesión
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 user:    { $ref: '#/components/schemas/Usuario' }
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/auth/profile:
 *   patch:
 *     summary: Actualizar perfil propio
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:       { type: string }
 *               apellido1:    { type: string }
 *               apellido2:    { type: string }
 *               direccion:    { type: string }
 *               codigoPostal: { type: string }
 *               localidad:    { type: string }
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 user:    { $ref: '#/components/schemas/Usuario' }
 *       400:
 *         description: No hay datos para actualizar
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /api/auth/avatar:
 *   patch:
 *     summary: Subir avatar propio
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [avatar]
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:   { type: boolean, example: true }
 *                 message:   { type: string }
 *                 user:      { $ref: '#/components/schemas/Usuario' }
 *       400:
 *         description: No se proporcionó imagen
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */