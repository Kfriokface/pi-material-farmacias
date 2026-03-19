const express = require('express');
const router  = express.Router();
const prisma  = require('../lib/prisma');
const { emailSolicitudEnviada } = require('../lib/email');

/**
 * GET /api/fabricante/confirmar/:token
 * Endpoint público (sin autenticación) para que el fabricante confirme el envío.
 * El enlace se envía por email al pasar una solicitud a EN_FABRICACION.
 */
router.get('/confirmar/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const solicitud = await prisma.solicitud.findUnique({
      where: { tokenFabricante: token },
      include: {
        material: { select: { nombre: true, codigo: true } },
      },
    });

    if (!solicitud) {
      return res.status(404).send(paginaHTML(
        'Enlace no válido',
        'Este enlace no es válido o ya ha caducado.',
        false,
      ));
    }

    if (solicitud.estado === 'ENVIADA' || solicitud.estado === 'COMPLETADA') {
      return res.send(paginaHTML(
        'Envío ya confirmado',
        `El pedido #${solicitud.id} (${solicitud.material?.nombre}) ya fue confirmado anteriormente. Gracias.`,
        true,
      ));
    }

    if (solicitud.estado !== 'EN_FABRICACION') {
      return res.status(400).send(paginaHTML(
        'No disponible',
        `Este pedido no está en estado de fabricación (estado actual: ${solicitud.estado}).`,
        false,
      ));
    }

    const updated = await prisma.solicitud.update({
      where: { id: solicitud.id },
      data: {
        estado:             'ENVIADA',
        enviadaProveedorEn: new Date(),
        tokenFabricante:    null, // invalidar el token tras su uso
      },
      include: {
        material:       { select: { nombre: true, codigo: true } },
        establecimiento: { select: { nombre: true } },
      },
    });

    // Notificar al solicitante y a su gerente (en background)
    setImmediate(async () => {
      try {
        const solicitante = await prisma.usuario.findUnique({
          where: { id: solicitud.usuarioId },
        });

        let gerente = null;
        if (solicitante?.zonaId) {
          gerente = await prisma.usuario.findFirst({
            where: { rol: 'GERENTE', zonaId: solicitante.zonaId, activo: true },
          });
        }

        const destinatarios = [solicitante];
        if (gerente && gerente.id !== solicitante?.id) destinatarios.push(gerente);

        for (const dest of destinatarios) {
          if (dest?.email) {
            await emailSolicitudEnviada({ solicitud: updated, destinatario: dest });
          }
        }
      } catch (err) {
        console.error('[Fabricante] Error al enviar emails de envío confirmado:', err.message);
      }
    });

    return res.send(paginaHTML(
      'Envío confirmado',
      `Gracias. El pedido #${solicitud.id} (${solicitud.material?.nombre}) ha sido marcado como enviado. El equipo de Material Farmacias ha sido notificado.`,
      true,
    ));
  } catch (err) {
    console.error('[Fabricante] Error al confirmar envío:', err.message);
    return res.status(500).send(paginaHTML(
      'Error',
      'Ha ocurrido un error al procesar la confirmación. Por favor, inténtalo de nuevo o contacta con nosotros.',
      false,
    ));
  }
});

function paginaHTML(titulo, mensaje, exito) {
  const color = exito ? '#0e8d39' : '#dc2626';
  const icon  = exito ? '✓' : '✗';
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titulo} — Material Farmacias</title>
  <style>
    body { margin:0; padding:0; background:#f4f4f5; font-family:Arial,sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; }
    .card { background:#fff; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.1); padding:48px 40px; max-width:480px; width:90%; text-align:center; }
    .icon { font-size:56px; color:${color}; margin-bottom:16px; }
    h1 { font-size:22px; color:#111827; margin:0 0 12px; }
    p { font-size:15px; color:#6b7280; line-height:1.6; margin:0; }
    .brand { margin-top:32px; font-size:13px; color:#9ca3af; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${titulo}</h1>
    <p>${mensaje}</p>
    <p class="brand">Material Farmacias</p>
  </div>
</body>
</html>`;
}

module.exports = router;

// ============================================
// SWAGGER
// ============================================

/**
 * @openapi
 * tags:
 *   name: Fabricante
 *   description: Endpoint público para confirmación de envío por parte del fabricante
 */

/**
 * @openapi
 * /api/fabricante/confirmar/{token}:
 *   get:
 *     summary: Confirmar envío de pedido (enlace público sin autenticación)
 *     description: |
 *       El fabricante recibe este enlace por email al pasar una solicitud a EN_FABRICACION.
 *       Al acceder, la solicitud pasa a estado ENVIADA y el token queda invalidado.
 *       Devuelve una página HTML con el resultado (no JSON).
 *     tags: [Fabricante]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *         description: Token único de 64 caracteres hex generado al pasar a EN_FABRICACION
 *     responses:
 *       200:
 *         description: Página HTML con el resultado de la confirmación
 *         content:
 *           text/html:
 *             schema: { type: string }
 *       404:
 *         description: Token no válido o ya caducado (página HTML)
 *         content:
 *           text/html:
 *             schema: { type: string }
 */
