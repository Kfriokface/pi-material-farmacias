import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import solicitudService from '../../services/solicitudService';
import useAuthStore from '../../store/authStore';
import {
  ESTADOS_SOLICITUD_FILTRO,
  ESTADO_SOLICITUD_CLASSES,
  estadoLabel,
  nombreCompleto,
} from '../../utils/constants';

const FILES_URL = import.meta.env.VITE_FILES_URL || 'http://localhost:3000/files';

export default function AppSolicitudesList() {
  const { user } = useAuthStore();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [estadoFilter, setEstadoFilter] = useState('');

  // Estado para el panel de completar inline
  const [completandoId, setCompletandoId] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [completando, setCompletando] = useState(false);
  const [completarError, setCompletarError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadSolicitudes();
  }, [page, estadoFilter]);

  const loadSolicitudes = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 10 };
      if (estadoFilter) params.estado = estadoFilter;
      const response = await solicitudService.getAll(params);
      setSolicitudes(response.data);
      if (response.pagination) setTotalPages(response.pagination.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleIniciarCompletar = (id) => {
    setCompletandoId(id);
    setFotoFile(null);
    setCompletarError('');
  };

  const handleCancelarCompletar = () => {
    setCompletandoId(null);
    setFotoFile(null);
    setCompletarError('');
  };

  const handleConfirmarCompletar = async (solicitudId) => {
    setCompletando(true);
    setCompletarError('');
    try {
      if (fotoFile) {
        // Subir foto → auto-marca como COMPLETADA
        await solicitudService.uploadFoto(solicitudId, fotoFile);
      } else {
        // Sin foto → marcar directamente como COMPLETADA
        await solicitudService.completar(solicitudId);
      }
      setCompletandoId(null);
      setFotoFile(null);
      await loadSolicitudes();
    } catch (err) {
      setCompletarError(err.response?.data?.message || 'Error al completar la solicitud');
    } finally {
      setCompletando(false);
    }
  };

  if (loading && solicitudes.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Cargando solicitudes...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Solicitudes</h1>
        <p className="text-gray-600">Seguimiento de tus pedidos de material</p>
      </div>

      {/* Filtros de estado */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {ESTADOS_SOLICITUD_FILTRO.map((e) => (
          <button
            key={e.value}
            onClick={() => { setEstadoFilter(e.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
              estadoFilter === e.value
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-300 text-gray-600 hover:border-primary-400'
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Lista de solicitudes */}
      {solicitudes.length === 0 && !loading ? (
        <div className="text-center py-16">
          <div className="text-gray-300 text-6xl mb-4">📦</div>
          <p className="text-gray-500 text-lg">No tienes solicitudes</p>
          <Link
            to="/app/materiales"
            className="inline-block mt-4 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700"
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {solicitudes.map((s) => (
            <div key={s.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex gap-4">
                {/* Thumbnail */}
                {s.material?.thumbnail ? (
                  <img
                    src={`${FILES_URL}/${s.material.thumbnail}`}
                    alt={s.material.nombre}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <span className="text-gray-400 text-2xl">📦</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-semibold text-gray-900 truncate">
                      {s.material?.nombre || 'Material'}
                    </p>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ${
                      ESTADO_SOLICITUD_CLASSES[s.estado] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {estadoLabel(s.estado)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mt-0.5 truncate">
                    {s.establecimiento?.nombre}
                  </p>
                  {s.usuario && s.usuarioId !== user?.id && (
                    <p className="text-xs text-primary-600 mt-0.5 truncate">
                      Solicitante: {s.usuario.rol === 'ADMIN' ? 'Administración' : nombreCompleto(s.usuario)}
                    </p>
                  )}

                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-400">
                      {new Date(s.createdAt).toLocaleDateString('es-ES', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                    {s.importeTotal != null && (
                      <p className="text-sm font-semibold text-gray-900">
                        {s.importeTotal.toFixed(2)} €
                      </p>
                    )}
                  </div>

                  {(s.altoCm || s.talla || s.orientacion) && (
                    <div className="flex gap-3 mt-2 text-xs text-gray-500">
                      {s.altoCm && s.anchoCm && <span>{s.altoCm}×{s.anchoCm} cm</span>}
                      {s.talla && <span>Talla {s.talla}</span>}
                      {s.orientacion && <span>{s.orientacion.charAt(0) + s.orientacion.slice(1).toLowerCase()}</span>}
                    </div>
                  )}
                </div>
              </div>

              {s.observaciones && s.estado === 'RECHAZADA' && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Motivo del rechazo</p>
                  <p className="text-sm text-gray-700">{s.observaciones}</p>
                </div>
              )}

              {/* Panel de completar — solo disponible para el solicitante */}
              {s.estado === 'EN_FABRICACION' && s.usuarioId === user?.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {completandoId === s.id ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700">
                        ¿Has recibido el material? Puedes adjuntar una foto de la instalación.
                      </p>

                      <label className="block">
                        <span className="sr-only">Foto de instalación</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFotoFile(e.target.files[0] || null)}
                          className="block w-full text-sm text-gray-500
                            file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                            file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700
                            hover:file:bg-primary-100"
                        />
                      </label>
                      {fotoFile && (
                        <p className="text-xs text-gray-500">{fotoFile.name}</p>
                      )}

                      {completarError && (
                        <p className="text-sm text-red-600">{completarError}</p>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConfirmarCompletar(s.id)}
                          disabled={completando}
                          className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                        >
                          {completando ? 'Procesando...' : 'Confirmar recepción'}
                        </button>
                        <button
                          onClick={handleCancelarCompletar}
                          disabled={completando}
                          className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleIniciarCompletar(s.id)}
                      className="w-full py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      Marcar como recibido
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="px-4 py-2 text-sm text-gray-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
