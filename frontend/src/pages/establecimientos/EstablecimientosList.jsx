import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import establecimientoService from '../../services/establecimientoService';
import useAuthStore from '../../store/authStore';
import { TIPOS_ESTABLECIMIENTO_FILTRO, nombreCompleto } from '../../utils/constants';

export default function EstablecimientosList() {
  const { user } = useAuthStore();
  const [establecimientos, setEstablecimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');

  useEffect(() => {
    loadEstablecimientos();
  }, [page, search, tipoFilter]);

  const loadEstablecimientos = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 20 };
      if (search.trim()) params.search = search;
      if (tipoFilter) params.tipo = tipoFilter;
      const response = await establecimientoService.getAll(params);
      setEstablecimientos(response.data);
      if (response.pagination) setTotalPages(response.pagination.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar establecimientos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadEstablecimientos();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de desactivar este establecimiento?')) return;
    try {
      await establecimientoService.delete(id);
      loadEstablecimientos();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar establecimiento');
    }
  };

  if (loading && establecimientos.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Cargando establecimientos...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Establecimientos</h1>
      </div>

      <form onSubmit={handleSearch} className="mb-6 flex flex-col sm:flex-row sm:flex-wrap md:flex-nowrap gap-2">
        <input
          type="text"
          placeholder="Buscar por nombre, provincia o localidad..."
          className="min-w-0 sm:basis-full md:flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="min-w-0 sm:flex-1 md:flex-none px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={tipoFilter}
          onChange={(e) => { setTipoFilter(e.target.value); setPage(1); }}
        >
          {TIPOS_ESTABLECIMIENTO_FILTRO.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        {user?.rol === 'ADMIN' && (
          <Link to="/admin/establecimientos/nuevo" className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 text-center whitespace-nowrap">
            Nuevo Establecimiento
          </Link>
        )}
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="relative"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provincia</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {establecimientos.map((est) => (
              <tr key={est.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{est.nombre}</div>
                  {est.codigoInterno && (
                    <div className="text-xs text-gray-400">{est.codigoInterno}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    est.tipo === 'FARMACIA'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {est.tipo === 'FARMACIA' ? 'Farmacia' : 'Clínica'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {est.provincia || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    est.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {est.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {user?.rol === 'ADMIN' && (
                    <>
                      <Link
                        to={`/admin/establecimientos/${est.id}/editar`}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        Editar
                      </Link>
                      {est.activo && (
                        <button
                          onClick={() => handleDelete(est.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent md:hidden" />
        </div>

        {establecimientos.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            No se encontraron establecimientos
          </div>
        )}
      </div>

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