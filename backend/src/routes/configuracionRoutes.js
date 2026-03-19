const express = require('express');
const router  = express.Router();

const authenticate = require('../middleware/authenticate');
const authorize    = require('../middleware/authorize');
const handleValidationErrors = require('../middleware/validation');

const {
  getConfiguracion,
  updateConfiguracion,
} = require('../controllers/configuracionController');

const { updateConfiguracionValidation } = require('../validators/configuracionValidator');

// Todos los autenticados pueden ver la configuración
router.get('/', authenticate, getConfiguracion);

// Solo ADMIN puede modificarla
router.put('/', authenticate, authorize('ADMIN'), updateConfiguracionValidation, handleValidationErrors, updateConfiguracion);

module.exports = router;

// ============================================
// SWAGGER
// ============================================

/**
 * @openapi
 * tags:
 *   name: Configuración
 *   description: Configuración global del sistema (registro único, id=1)
 *
 * components:
 *   schemas:
 *     Configuracion:
 *       type: object
 *       properties:
 *         id:                 { type: integer, example: 1 }
 *         limiteUsuarioAnual: { type: number, nullable: true, description: "Límite de gasto anual por usuario (€)" }
 *         soporteNombre:      { type: string, nullable: true }
 *         soporteEmail:       { type: string, nullable: true }
 *         soporteTelefono:    { type: string, nullable: true }
 *         appNombre:          { type: string, nullable: true }
 *         avisoActivo:        { type: boolean, example: false, description: "Modo mantenimiento — bloquea acceso a no-admins" }
 *         avisoTexto:         { type: string, nullable: true, description: "Mensaje que se muestra durante el mantenimiento" }
 *         emailAdmin:         { type: string, nullable: true, description: "Email que recibe notificaciones del sistema" }
 */

/**
 * @openapi
 * /api/configuracion:
 *   get:
 *     summary: Obtener configuración del sistema
 *     tags: [Configuración]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuración actual
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Configuracion' }
 *
 *   put:
 *     summary: Actualizar configuración del sistema (solo ADMIN)
 *     tags: [Configuración]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               limiteUsuarioAnual: { type: number }
 *               soporteNombre:      { type: string }
 *               soporteEmail:       { type: string }
 *               soporteTelefono:    { type: string }
 *               appNombre:          { type: string }
 *               avisoActivo:        { type: boolean }
 *               avisoTexto:         { type: string }
 *               emailAdmin:         { type: string }
 *     responses:
 *       200:
 *         description: Configuración actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Configuracion' }
 *       400:
 *         description: No hay datos para actualizar
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */