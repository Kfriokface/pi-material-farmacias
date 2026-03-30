import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import solicitudService from '../../services/solicitudService';
import useAuthStore from '../../store/authStore';
import {
  ESTADO_SOLICITUD_CLASSES,
  estadoLabel,
  nombreCompleto,
} from '../../utils/constants';

const FILES_URL = import.meta.env.VITE_FILES_URL || 'http://localhost:3000/files';

const TALLA_LABEL = {
  XS: 'XS', S: 'S', M: 'M', L: 'L', XL: 'XL', XXL: 'XXL', XXXL: 'XXXL',
};

const ORIENTACION_LABEL = {
  HORIZONTAL: 'Horizontal',
  VERTICAL:   'Vertical',
  CUADRADO:   'Cuadrado',
};

const TRANSICIONES = {
  ADMIN: {
    PENDIENTE:      ['EN_FABRICACION', 'RECHAZADA'],
    EN_FABRICACION: [],
    RECHAZADA:      [],
    COMPLETADA:     [],
  },
  GERENTE: {
    PENDIENTE:      [],
    EN_FABRICACION: [],
    RECHAZADA:      [],
    COMPLETADA:     [],
  },
};

const ACCION_LABEL = {
  RECHAZADA:      'Rechazar',
  EN_FABRICACION: 'Enviar a fabricación',
};

const ACCION_CLASSES = {
  RECHAZADA:      'bg-gray-600 hover:bg-gray-700 text-white',
  EN_FABRICACION: 'bg-primary-600 hover:bg-primary-700 text-white',
};

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">{value}</span>
    </div>
  );
}

export default function SolicitudDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [observaciones, setObservaciones] = useState('');
  const [accionPendiente, setAccionPendiente] = useState(null);

  useEffect(() => {
    loadSolicitud();
  }, [id]);

  const loadSolicitud = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await solicitudService.getById(id);
      setSolicitud(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async () => {
    if (!accionPendiente) return;
    setCambiandoEstado(true);
    try {
      await solicitudService.cambiarEstado(id, accionPendiente, observaciones || null);
      setAccionPendiente(null);
      setObservaciones('');
      await loadSolicitud();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar el estado');
    } finally {
      setCambiandoEstado(false);
    }
  };

  const handleIniciarAccion = (estado) => {
    setAccionPendiente(estado);
    setObservaciones('');
  };

  const transicionesDisponibles = solicitud
    ? (TRANSICIONES[user?.rol]?.[solicitud.estado] || [])
    : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Cargando solicitud...</p>
      </div>
    );
  }

  if (error && !solicitud) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4">
        <button
          onClick={() => navigate('/admin/solicitudes')}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Solicitudes
        </button>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solicitud #{solicitud.id}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date(solicitud.createdAt).toLocaleDateString('es-ES', {
              year: 'numeric', month: 'long', day: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
        <span className={`ml-auto px-3 py-1 text-sm font-semibold rounded-full ${
          ESTADO_SOLICITUD_CLASSES[solicitud.estado] || 'bg-gray-100 text-gray-800'
        }`}>
          {estadoLabel(solicitud.estado)}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Avisos de límite */}
      {(solicitud.avisoLimiteUsuario || solicitud.avisoLimiteFarmacia) && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg mb-6">
          <p className="font-semibold">⚠️ Aviso de límite de gasto</p>
          {solicitud.avisoLimiteUsuario && (
            <p className="text-sm mt-1">El solicitante superaba su límite mensual al crear esta solicitud.</p>
          )}
          {solicitud.avisoLimiteFarmacia && (
            <p className="text-sm mt-1">El establecimiento superaba su límite mensual al crear esta solicitud.</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Columna principal ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Material */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Material solicitado</h2>
            <div className="flex gap-4 mb-4">
              {solicitud.material?.thumbnail && (
                <img
                  src={`${FILES_URL}/${solicitud.material.thumbnail}`}
                  alt={solicitud.material.nombre}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div>
                <p className="font-medium text-gray-900">{solicitud.material?.nombre}</p>
                <p className="text-sm text-gray-500">{solicitud.material?.codigo}</p>
                {solicitud.material?.proveedor && (
                  <p className="text-xs text-gray-400 mt-0.5">{solicitud.material.proveedor.nombre}</p>
                )}
              </div>
            </div>

            {/* Especificaciones */}
            <div className="border-t pt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {solicitud.altoCm && solicitud.anchoCm && (
                <div>
                  <span className="text-gray-500">Medidas</span>
                  <p className="font-medium">
                    {solicitud.altoCm} × {solicitud.anchoCm} cm
                    <span className="text-gray-400 ml-1">
                      ({(solicitud.altoCm * solicitud.anchoCm / 10000).toFixed(2)} m²)
                    </span>
                  </p>
                </div>
              )}
              {solicitud.orientacion && (
                <div>
                  <span className="text-gray-500">Orientación</span>
                  <p className="font-medium">{ORIENTACION_LABEL[solicitud.orientacion] || solicitud.orientacion}</p>
                </div>
              )}
              {solicitud.talla && (
                <div>
                  <span className="text-gray-500">Talla</span>
                  <p className="font-medium">{TALLA_LABEL[solicitud.talla] || solicitud.talla}</p>
                </div>
              )}
              {solicitud.marca && (
                <div>
                  <span className="text-gray-500">Marca</span>
                  <p className="font-medium">{solicitud.marca.nombre}</p>
                </div>
              )}
              {solicitud.lenguaPersonalizacion && (
                <div>
                  <span className="text-gray-500">Idioma del material</span>
                  <p className="font-medium">
                    {{ ES: 'Castellano', CA: 'Catalán', EU: 'Euskera', GL: 'Gallego', VA: 'Valenciano' }[solicitud.lenguaPersonalizacion] || solicitud.lenguaPersonalizacion}
                  </p>
                </div>
              )}
              {solicitud.personalizacionBata && (
                <div className="col-span-2">
                  <span className="text-gray-500">Personalización bata</span>
                  <p className="font-medium">{solicitud.personalizacionBata}</p>
                </div>
              )}
            </div>

            {solicitud.observaciones && (
              <div className="mt-4 pt-4 border-t">
                <span className="text-sm text-gray-500">Observaciones del solicitante</span>
                <p className="text-sm text-gray-700 mt-1">{solicitud.observaciones}</p>
              </div>
            )}

            {(() => {
              const archivos = JSON.parse(solicitud.archivosPersonalizacion || '[]');
              if (!archivos.length) return null;
              return (
                <div className="mt-4 pt-4 border-t">
                  <span className="text-sm text-gray-500 block mb-3">
                    Archivos adjuntos ({archivos.length})
                  </span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {archivos.map((path, i) => {
                      const url = `${FILES_URL}/${path}`;
                      const isPdf = path.endsWith('.pdf');
                      return isPdf ? (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-primary-600"
                        >
                          <span className="text-xl">📄</span>
                          <span className="truncate">Archivo {i + 1}.pdf</span>
                        </a>
                      ) : (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                          <img
                            src={url}
                            alt={`Archivo personalización ${i + 1}`}
                            className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition"
                          />
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Solicitante + Establecimiento en fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Solicitante</h2>
              <p className="font-medium text-gray-900">{nombreCompleto(solicitud.usuario)}</p>
              <p className="text-sm text-gray-500">{solicitud.usuario?.email}</p>
              {solicitud.usuario?.area && (
                <p className="text-sm text-gray-400 mt-1">{solicitud.usuario.area.nombre}</p>
              )}
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Establecimiento</h2>
              <p className="font-medium text-gray-900">{solicitud.establecimiento?.nombre}</p>
              {solicitud.establecimiento?.localidad && (
                <p className="text-sm text-gray-500">{solicitud.establecimiento.localidad}</p>
              )}
              {solicitud.establecimiento?.provincia && (
                <p className="text-sm text-gray-400">{solicitud.establecimiento.provincia}</p>
              )}
            </div>
          </div>

          {/* Importe */}
          <div className="bg-white shadow rounded-lg p-6 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Importe total</h2>
            <p className="text-3xl font-bold text-gray-900">{solicitud.importeTotal?.toFixed(2)} €</p>
          </div>

          {/* Dirección de entrega solicitada */}
          {solicitud.direccionEntrega && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Dirección de entrega solicitada</h2>
              <p className="text-gray-700">{solicitud.direccionEntrega}</p>
              <p className="text-gray-700">
                {[solicitud.codigoPostalEntrega, solicitud.localidadEntrega, solicitud.provinciaEntrega]
                  .filter(Boolean).join(' — ')}
              </p>
              {solicitud.telefonoEntrega && (
                <p className="text-gray-500 text-sm mt-1">{solicitud.telefonoEntrega}</p>
              )}
            </div>
          )}

          {/* Dirección de entrega final (fijada al pasar a fabricación) */}
          {solicitud.direccionEntregaFinal && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-base font-semibold text-blue-900 mb-3">Dirección de entrega confirmada</h2>
              <p className="text-blue-800">{solicitud.direccionEntregaFinal}</p>
              <p className="text-blue-800">
                {[solicitud.codigoPostalEntregaFinal, solicitud.localidadEntregaFinal, solicitud.provinciaEntregaFinal]
                  .filter(Boolean).join(' — ')}
              </p>
              {solicitud.telefonoEntregaFinal && (
                <p className="text-blue-600 text-sm mt-1">{solicitud.telefonoEntregaFinal}</p>
              )}
              {solicitud.proveedorEnviado && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <span className="text-sm text-blue-600">Proveedor</span>
                  <p className="font-medium text-blue-900">{solicitud.proveedorEnviado.nombre}</p>
                  {solicitud.proveedorEnviado.emails?.find(e => e.tipo === 'DEFAULT')?.email && (
                    <p className="text-sm text-blue-600">{solicitud.proveedorEnviado.emails.find(e => e.tipo === 'DEFAULT').email}</p>
                  )}
                  {solicitud.proveedorEnviado.telefono && (
                    <p className="text-sm text-blue-600">{solicitud.proveedorEnviado.telefono}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Historial */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Historial</h2>
            <div className="space-y-0">
              <InfoRow label="Creada"               value={new Date(solicitud.createdAt).toLocaleDateString('es-ES')} />
              <InfoRow label="Rechazada"            value={solicitud.rechazadaEn    && new Date(solicitud.rechazadaEn).toLocaleDateString('es-ES')} />
              <InfoRow label="Enviada a fabricación" value={solicitud.enviadaProveedorEn && new Date(solicitud.enviadaProveedorEn).toLocaleDateString('es-ES')} />
              <InfoRow label="Completada"           value={solicitud.completadaEn   && new Date(solicitud.completadaEn).toLocaleDateString('es-ES')} />
            </div>
          </div>

          {/* Fotos de instalación */}
          {solicitud.fotosInstalacion?.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Fotos de instalación ({solicitud.fotosInstalacion.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {solicitud.fotosInstalacion.map((foto) => (
                  <a
                    key={foto.id}
                    href={`${FILES_URL}/${foto.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={`${FILES_URL}/${foto.url}`}
                      alt="Foto instalación"
                      className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Columna lateral: solo acciones ── */}
        <div>
          {transicionesDisponibles.length > 0 ? (
            <div className="bg-white shadow rounded-lg p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Gestión</h2>

              {accionPendiente ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    ¿Confirmas <strong>{ACCION_LABEL[accionPendiente]}</strong> esta solicitud?
                  </p>

                  {/* Resumen del pedido al proveedor */}
                  {accionPendiente === 'EN_FABRICACION' && (
                    <div className="bg-primary-50 border border-primary-200 rounded-md p-3 space-y-1">
                      <p className="text-xs font-semibold text-primary-800 mb-2">Resumen del pedido al proveedor</p>
                      <div className="text-xs text-primary-700 space-y-1">
                        <p><span className="text-primary-500">Proveedor:</span> {solicitud.material?.proveedor?.nombre || '—'}</p>
                        {solicitud.material?.codigo && <p><span className="text-primary-500">Código:</span> {solicitud.material.codigo}</p>}
                        {solicitud.altoCm && solicitud.anchoCm && <p><span className="text-primary-500">Medidas:</span> {solicitud.altoCm} × {solicitud.anchoCm} cm</p>}
                        {solicitud.talla && <p><span className="text-primary-500">Talla:</span> {solicitud.talla}</p>}
                        {solicitud.marca && <p><span className="text-primary-500">Marca:</span> {solicitud.marca.nombre}</p>}
                        {solicitud.lenguaPersonalizacion && <p><span className="text-primary-500">Idioma:</span> {{ ES: 'Castellano', CA: 'Catalán', EU: 'Euskera', GL: 'Gallego', VA: 'Valenciano' }[solicitud.lenguaPersonalizacion] || solicitud.lenguaPersonalizacion}</p>}
                        {solicitud.personalizacionBata && <p><span className="text-primary-500">Personalización bata:</span> {solicitud.personalizacionBata}</p>}
                        {(() => {
                          const n = JSON.parse(solicitud.archivosPersonalizacion || '[]').length;
                          return n > 0 ? <p><span className="text-primary-500">Archivos adjuntos:</span> {n} archivo(s)</p> : null;
                        })()}
                        <p>
                          <span className="text-primary-500">Dirección de entrega:</span>{' '}
                          {solicitud.direccionEntrega
                            ? [solicitud.direccionEntrega, solicitud.codigoPostalEntrega, solicitud.localidadEntrega].filter(Boolean).join(', ')
                            : 'Dirección de la gerencia de zona'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Observaciones para rechazo o fabricación */}
                  {(accionPendiente === 'RECHAZADA' || accionPendiente === 'EN_FABRICACION') && (
                    <textarea
                      rows="3"
                      placeholder={
                        accionPendiente === 'RECHAZADA'
                          ? 'Motivo del rechazo (opcional)...'
                          : 'Observaciones para el proveedor (opcional)...'
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                    />
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleCambiarEstado}
                      disabled={cambiandoEstado}
                      className={`flex-1 py-2 rounded text-sm font-medium disabled:opacity-50 ${ACCION_CLASSES[accionPendiente]}`}
                    >
                      {cambiandoEstado ? 'Procesando...' : 'Confirmar'}
                    </button>
                    <button
                      onClick={() => { setAccionPendiente(null); setObservaciones(''); }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {transicionesDisponibles.map((estado) => (
                    <button
                      key={estado}
                      onClick={() => handleIniciarAccion(estado)}
                      className={`w-full py-2.5 rounded text-sm font-medium ${ACCION_CLASSES[estado]}`}
                    >
                      {ACCION_LABEL[estado]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-sm text-gray-500">
              No hay acciones disponibles para este estado.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
