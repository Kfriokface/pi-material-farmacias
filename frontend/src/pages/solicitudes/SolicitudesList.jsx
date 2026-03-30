import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import solicitudService from '../../services/solicitudService';
import useAuthStore from '../../store/authStore';
import {
  ESTADOS_SOLICITUD_FILTRO,
  ESTADO_SOLICITUD_CLASSES,
  estadoLabel,
  nombreCompleto,
} from '../../utils/constants';

export default function SolicitudesList() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filtros — leer desde URL para que funcionen los links del dashboard
  const [estadoFilter, setEstadoFilter] = useState(searchParams.get('estado') || '');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadSolicitudes();
  }, [page, estadoFilter, search]);

  const loadSolicitudes = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 20 };
      if (estadoFilter) params.estado = estadoFilter;
      if (search.trim()) params.search = search;
      const response = await solicitudService.getAll(params);
      setSolicitudes(response.data);
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages);
        setTotal(response.pagination.total);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoFilter = (estado) => {
    setEstadoFilter(estado);
    setPage(1);
    setSearchParams(estado ? { estado } : {});
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadSolicitudes();
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solicitudes</h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-1">{total} solicitudes encontradas</p>
          )}
        </div>
        <Link
          to="/admin/solicitudes/nueva"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          + Nueva solicitud
        </Link>
      </div>

      {/* Filtros rápidos por estado */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {ESTADOS_SOLICITUD_FILTRO.map((e) => (
          <button
            key={e.value}
            onClick={() => handleEstadoFilter(e.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              estadoFilter === e.value
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-300 text-gray-600 hover:border-primary-400'
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>

      {/* Búsqueda */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Buscar por solicitante, material o establecimiento..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700">
          Buscar
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="relative"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Establecimiento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Importe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {solicitudes.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  #{s.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {s.usuario ? nombreCompleto(s.usuario) : '-'}
                  </div>
                  {s.usuario?.area && (
                    <div className="text-xs text-gray-400">{s.usuario.area.nombre}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{s.material?.nombre || '-'}</div>
                  <div className="text-xs text-gray-400">{s.material?.codigo}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{s.establecimiento?.nombre || '-'}</div>
                  <div className="text-xs text-gray-400">{s.establecimiento?.localidad}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-medium">
                    {s.importeTotal != null ? `${s.importeTotal.toFixed(2)} €` : '-'}
                  </div>
                  {/* Avisos de límite */}
                  {(s.avisoLimiteUsuario || s.avisoLimiteFarmacia) && (
                    <div className="text-xs text-yellow-600 mt-0.5">
                      ⚠️ {s.avisoLimiteUsuario && s.avisoLimiteFarmacia
                        ? 'Límite usuario y farmacia'
                        : s.avisoLimiteUsuario
                        ? 'Límite usuario'
                        : 'Límite farmacia'}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    ESTADO_SOLICITUD_CLASSES[s.estado] || 'bg-gray-100 text-gray-800'
                  }`}>
                    {estadoLabel(s.estado)}                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(s.createdAt).toLocaleDateString('es-ES')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    to={`/admin/solicitudes/${s.id}`}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent md:hidden" />
        </div>

        {solicitudes.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            No se encontraron solicitudes
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="px-4 py-2">Página {page} de {totalPages}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}