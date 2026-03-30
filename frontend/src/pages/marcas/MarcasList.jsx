import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import marcaService from '../../services/marcaService';

export default function MarcasList() {
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [activoFilter, setActivoFilter] = useState('');

  useEffect(() => {
    loadMarcas();
  }, [page, search, activoFilter]);

  const loadMarcas = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 20 };
      if (search.trim()) params.search = search;
      if (activoFilter !== '') params.activo = activoFilter;
      const response = await marcaService.getAll(params);
      setMarcas(response.data);
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar marcas');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadMarcas();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de desactivar esta marca?')) return;

    try {
      await marcaService.delete(id);
      loadMarcas();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar marca');
    }
  };

  if (loading && marcas.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Cargando marcas...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Marcas</h1>
      </div>

      {/* Búsqueda y filtros */}
      <form onSubmit={handleSearch} className="mb-6 flex flex-col sm:flex-row sm:flex-wrap md:flex-nowrap gap-2">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          className="min-w-0 sm:basis-full md:flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          className="min-w-0 sm:flex-1 md:flex-none px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={activoFilter}
          onChange={(e) => { setActivoFilter(e.target.value); setPage(1); }}
        >
          <option value="">Ver todas</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
        <Link to="/admin/marcas/nueva" className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 text-center whitespace-nowrap">
          Nueva Marca
        </Link>
      </form>

      {/* Error */}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Materiales</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {marcas.map((marca) => (
              <tr key={marca.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {marca.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{marca.nombre}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      marca.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {marca.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {marca._count?.materiales || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    to={`/admin/marcas/${marca.id}/editar`}
                    className="text-primary-600 hover:text-primary-900 mr-4"
                  >
                    Editar
                  </Link>
                  {marca.activo && (
                    <button
                      onClick={() => handleDelete(marca.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent md:hidden" />
        </div>

        {marcas.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            No se encontraron marcas
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
          <span className="px-4 py-2">
            Página {page} de {totalPages}
          </span>
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