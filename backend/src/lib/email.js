const nodemailer = require('nodemailer');

// ============================================
// TRANSPORTER
// ============================================

let _transporter = null;

function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   parseInt(process.env.SMTP_PORT || '587'),
      secure: parseInt(process.env.SMTP_PORT || '587') === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return _transporter;
}

// ============================================
// FUNCIÓN BASE
// ============================================

async function sendEmail({ to, subject, html }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[Email] SMTP no configurado — email no enviado:', subject, '→', to);
    return;
  }
  try {
    await getTransporter().sendMail({
      from: process.env.SMTP_FROM || 'Material Farmacias <noreply@materialfarmacias.com>',
      to,
      subject,
      html,
    });
    console.log(`[Email] Enviado: "${subject}" → ${to}`);
  } catch (err) {
    console.error('[Email] Error al enviar:', err.message);
    // No lanzamos — los emails no deben bloquear el flujo principal
  }
}

// ============================================
// HELPERS DE FORMATO
// ============================================

function nombreUsuario(u) {
  if (!u) return 'Usuario';
  if (u.apellido1) return `${u.nombre} ${u.apellido1}`;
  return u.nombre || u.email || 'Usuario';
}

function formatFecha(date) {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ============================================
// PLANTILLA BASE
// ============================================

function layout(titulo, contenido) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titulo}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.1);">
        <!-- Cabecera -->
        <tr>
          <td style="background:#0e8d39;padding:24px 32px;">
            <p style="margin:0;color:#ffffff;font-size:20px;font-weight:bold;">Material Farmacias</p>
          </td>
        </tr>
        <!-- Contenido -->
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 16px;font-size:20px;color:#111827;">${titulo}</h1>
            ${contenido}
          </td>
        </tr>
        <!-- Pie -->
        <tr>
          <td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#6b7280;">
              Este es un mensaje automático. Por favor, no respondas a este correo.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function infoRow(label, value) {
  if (!value) return '';
  return `<tr>
    <td style="padding:6px 0;font-size:14px;color:#6b7280;width:40%;">${label}</td>
    <td style="padding:6px 0;font-size:14px;color:#111827;font-weight:500;">${value}</td>
  </tr>`;
}

function boton(texto, url, color = '#0e8d39') {
  return `<div style="margin:24px 0;text-align:center;">
    <a href="${url}" style="background:${color};color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:bold;display:inline-block;">${texto}</a>
  </div>`;
}

// ============================================
// EMAILS DE SOLICITUD
// ============================================

/**
 * Email al solicitante/gerente cuando se rechaza la solicitud
 */
async function emailSolicitudRechazada({ solicitud, destinatario }) {
  const nombre = nombreUsuario(destinatario);
  const contenido = `
    <p style="color:#374151;font-size:15px;margin:0 0 16px;">Hola ${nombre},</p>
    <p style="color:#374151;font-size:15px;margin:0 0 24px;">
      La solicitud <strong>#${solicitud.id}</strong> ha sido <strong style="color:#dc2626;">rechazada</strong>.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:24px;">
      <tr style="background:#f9fafb;">
        <td colspan="2" style="padding:10px 16px;font-size:13px;font-weight:bold;color:#374151;border-bottom:1px solid #e5e7eb;">
          Detalle de la solicitud
        </td>
      </tr>
      <tr><td colspan="2" style="padding:12px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${infoRow('Material', solicitud.material?.nombre)}
          ${infoRow('Establecimiento', solicitud.establecimiento?.nombre || solicitud.eventoNombre || '-')}
          ${infoRow('Fecha solicitud', formatFecha(solicitud.createdAt))}
          ${solicitud.observaciones ? infoRow('Motivo del rechazo', solicitud.observaciones) : ''}
        </table>
      </td></tr>
    </table>
    <p style="color:#6b7280;font-size:13px;">Si tienes dudas contacta con el administrador.</p>
  `;
  await sendEmail({
    to:      destinatario.email,
    subject: `Solicitud #${solicitud.id} rechazada — Material Farmacias`,
    html:    layout('Solicitud rechazada', contenido),
  });
}

/**
 * Email al solicitante/gerente cuando pasa a EN_FABRICACION
 */
async function emailSolicitudEnFabricacion({ solicitud, destinatario }) {
  const nombre = nombreUsuario(destinatario);
  const contenido = `
    <p style="color:#374151;font-size:15px;margin:0 0 16px;">Hola ${nombre},</p>
    <p style="color:#374151;font-size:15px;margin:0 0 24px;">
      La solicitud <strong>#${solicitud.id}</strong> ha sido enviada a <strong style="color:#d97706;">fabricación</strong>.
      Recibirás una notificación cuando el pedido esté en camino.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:24px;">
      <tr style="background:#f9fafb;">
        <td colspan="2" style="padding:10px 16px;font-size:13px;font-weight:bold;color:#374151;border-bottom:1px solid #e5e7eb;">
          Detalle de la solicitud
        </td>
      </tr>
      <tr><td colspan="2" style="padding:12px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${infoRow('Material', solicitud.material?.nombre)}
          ${infoRow('Establecimiento', solicitud.establecimiento?.nombre || solicitud.eventoNombre || '-')}
          ${infoRow('Dirección de entrega', [
            solicitud.direccionEntregaFinal,
            solicitud.codigoPostalEntregaFinal,
            solicitud.localidadEntregaFinal,
          ].filter(Boolean).join(', '))}
          ${infoRow('Proveedor', solicitud.proveedorEnviado?.nombre)}
        </table>
      </td></tr>
    </table>
  `;
  await sendEmail({
    to:      destinatario.email,
    subject: `Solicitud #${solicitud.id} en fabricación — Material Farmacias`,
    html:    layout('Solicitud en fabricación', contenido),
  });
}

/**
 * Email al proveedor/fabricante con datos del nuevo pedido (sin enlace de confirmación)
 */
async function emailFabricanteNuevoPedido({ solicitud, emailProveedor, nombreProveedor }) {
  const appUrl = process.env.APP_URL || 'https://dev.far.webconsultas.net';

  const entrega = [
    solicitud.direccionEntregaFinal,
    solicitud.codigoPostalEntregaFinal,
    solicitud.localidadEntregaFinal,
    solicitud.provinciaEntregaFinal,
  ].filter(Boolean).join(', ');

  const contenido = `
    <p style="color:#374151;font-size:15px;margin:0 0 16px;">Estimado/a ${nombreProveedor || 'proveedor'},</p>
    <p style="color:#374151;font-size:15px;margin:0 0 24px;">
      Les comunicamos que han recibido un nuevo pedido.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:8px;">
      <tr style="background:#f9fafb;">
        <td colspan="2" style="padding:10px 16px;font-size:13px;font-weight:bold;color:#374151;border-bottom:1px solid #e5e7eb;">
          Detalle del pedido
        </td>
      </tr>
      <tr><td colspan="2" style="padding:12px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${infoRow('Referencia', `Pedido #${solicitud.id}`)}
          ${infoRow('Material', solicitud.material?.nombre)}
          ${infoRow('Código', solicitud.material?.codigo)}
          ${solicitud.marca ? infoRow('Marca', solicitud.marca.nombre) : ''}
          ${solicitud.altoCm && solicitud.anchoCm ? infoRow('Medidas', `${solicitud.altoCm} × ${solicitud.anchoCm} cm`) : ''}
          ${solicitud.talla ? infoRow('Talla', solicitud.talla) : ''}
          ${solicitud.personalizarNombre ? infoRow('Personalización', 'Incluir nombre del establecimiento') : ''}
          ${solicitud.descripcionPersonalizada ? infoRow('Descripción personalización', solicitud.descripcionPersonalizada) : ''}
          ${solicitud.personalizacionBata ? infoRow('Personalización bata', solicitud.personalizacionBata) : ''}
          ${entrega ? infoRow('Dirección de entrega', entrega) : ''}
          ${solicitud.telefonoEntregaFinal ? infoRow('Teléfono entrega', solicitud.telefonoEntregaFinal) : ''}
          ${solicitud.observaciones ? infoRow('Observaciones', solicitud.observaciones) : ''}
        </table>
      </td></tr>
      ${(() => {
        const archivos = solicitud.archivosPersonalizacion
          ? JSON.parse(solicitud.archivosPersonalizacion)
          : [];
        if (!archivos.length) return '';
        const links = archivos
          .map((path, i) => `<a href="${appUrl}/files/${path}" style="color:#0e8d39;display:block;margin-bottom:4px;">Archivo adjunto ${i + 1}</a>`)
          .join('');
        return `<tr><td colspan="2" style="padding:0 16px 12px;">
          <p style="font-size:13px;color:#6b7280;margin:0 0 6px;">Archivos adjuntos de personalización:</p>
          <div style="font-size:13px;">${links}</div>
        </td></tr>`;
      })()}
    </table>
  `;
  await sendEmail({
    to:      emailProveedor,
    subject: `Nuevo pedido #${solicitud.id} — Material Farmacias`,
    html:    layout(`Nuevo pedido #${solicitud.id}`, contenido),
  });
}

/**
 * Email al email de sistema cuando se crea una nueva solicitud
 */
async function emailSolicitudCreada({ solicitud, emailSistema }) {
  const appUrl = process.env.APP_URL || 'https://dev.far.webconsultas.net';
  const linkSolicitud = `${appUrl}/admin/solicitudes/${solicitud.id}`;

  const contenido = `
    <p style="color:#374151;font-size:15px;margin:0 0 16px;">
      Se ha creado una nueva solicitud <strong>#${solicitud.id}</strong>.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:24px;">
      <tr style="background:#f9fafb;">
        <td colspan="2" style="padding:10px 16px;font-size:13px;font-weight:bold;color:#374151;border-bottom:1px solid #e5e7eb;">
          Detalle
        </td>
      </tr>
      <tr><td colspan="2" style="padding:12px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${infoRow('Material', solicitud.material?.nombre)}
          ${infoRow('Solicitante', solicitud.usuario ? nombreUsuario(solicitud.usuario) : '-')}
          ${infoRow('Establecimiento', solicitud.establecimiento?.nombre || solicitud.eventoNombre || '-')}
          ${infoRow('Fecha', formatFecha(solicitud.createdAt))}
        </table>
      </td></tr>
    </table>
    ${boton('Ver solicitud en el panel', linkSolicitud)}
  `;
  await sendEmail({
    to:      emailSistema,
    subject: `Nueva solicitud #${solicitud.id} — Material Farmacias`,
    html:    layout('Nueva solicitud', contenido),
  });
}

/**
 * Email al email de sistema cuando una solicitud se completa
 */
async function emailSolicitudCompletada({ solicitud, emailSistema }) {
  const appUrl = process.env.APP_URL || 'https://dev.far.webconsultas.net';
  const linkSolicitud = `${appUrl}/admin/solicitudes/${solicitud.id}`;

  const contenido = `
    <p style="color:#374151;font-size:15px;margin:0 0 16px;">
      La solicitud <strong>#${solicitud.id}</strong> ha sido marcada como <strong style="color:#16a34a;">completada</strong>
      por el solicitante.
    </p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:24px;">
      <tr style="background:#f9fafb;">
        <td colspan="2" style="padding:10px 16px;font-size:13px;font-weight:bold;color:#374151;border-bottom:1px solid #e5e7eb;">
          Detalle
        </td>
      </tr>
      <tr><td colspan="2" style="padding:12px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${infoRow('Material', solicitud.material?.nombre)}
          ${infoRow('Solicitante', solicitud.usuario ? nombreUsuario(solicitud.usuario) : '-')}
          ${infoRow('Establecimiento', solicitud.establecimiento?.nombre || solicitud.eventoNombre || '-')}
          ${infoRow('Completada el', formatFecha(solicitud.completadaEn || new Date()))}
          ${solicitud.fotosInstalacion?.length ? infoRow('Fotos adjuntas', `${solicitud.fotosInstalacion.length} foto(s)`) : ''}
        </table>
      </td></tr>
    </table>
    ${boton('Ver solicitud en el panel', linkSolicitud)}
  `;
  await sendEmail({
    to:      emailSistema,
    subject: `Solicitud #${solicitud.id} completada — Material Farmacias`,
    html:    layout('Solicitud completada', contenido),
  });
}

module.exports = {
  emailSolicitudRechazada,
  emailSolicitudEnFabricacion,
  emailFabricanteNuevoPedido,
  emailSolicitudCreada,
  emailSolicitudCompletada,
};
