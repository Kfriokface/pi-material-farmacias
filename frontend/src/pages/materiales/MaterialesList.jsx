import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import materialService from '../../services/materialService';

const FILES_URL = import.meta.env.VITE_FILES_URL || 'http://localhost:3000/files';

export default function MaterialesList() {
  const navigate = useNavigate();
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [activoFilter, setActivoFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');

  useEffect(() => {
    loadMateriales();
  }, [page, search, activoFilter, tipoFilter]);

  const loadMateriales = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 20 };
      if (search.trim()) params.search = search;
      if (activoFilter !== '') params.activo = activoFilter;
      if (tipoFilter) params.tipoEstablecimiento = tipoFilter;
      const response = await materialService.getAll(params);
      setMateriales(response.data);
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages);
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar materiales');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadMateriales();
  };

  const handleDuplicate = async (id) => {
    try {
      const response = await materialService.duplicate(id);
      navigate(`/admin/materiales/${response.data.id}/editar`);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al duplicar material');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de desactivar este material?')) return;
    try {
      await materialService.delete(id);
      loadMateriales();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar material');
    }
  };

  if (loading && materiales.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Cargando materiales...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Materiales</h1>
      </div>

      {/* Búsqueda y filtros */}
      <form onSubmit={handleSearch} className="mb-6 flex flex-col sm:flex-row sm:flex-wrap md:flex-nowrap gap-2">
        <input
          type="text"
          placeholder="Buscar por nombre, proveedor o descripción..."
          className="min-w-0 sm:basis-full md:flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="min-w-0 sm:flex-1 md:flex-none px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={tipoFilter}
          onChange={(e) => { setTipoFilter(e.target.value); setPage(1); }}
        >
          <option value="">Lugar de aplicación</option>
          <option value="FARMACIA">Farmacia</option>
          <option value="CLINICA">Clínica</option>
          <option value="EVENTO">Evento</option>
        </select>
        <select
          className="min-w-0 sm:flex-1 md:flex-none px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={activoFilter}
          onChange={(e) => { setActivoFilter(e.target.value); setPage(1); }}
        >
          <option value="">Ver todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
        <Link to="/admin/materiales/nuevo" className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 text-center whitespace-nowrap">
          Nuevo Material
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio interno</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {materiales.map((material) => (
              <tr key={material.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-16 w-16 flex-shrink-0">
                    {material.thumbnail ? (
                      <img
                        src={`${FILES_URL}/${material.thumbnail}`}
                        alt={material.nombre}
                        className="h-16 w-16 object-cover rounded"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Sin img</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{material.nombre}</div>
                  <div className="text-sm text-gray-500">{material.codigo}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {material.marca?.nombre || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {material.precioPublico ? `${material.precioPublico.toFixed(2)} €` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {material.precio
                    ? `${material.precio.toFixed(2)} € ${material.tipoPrecio === 'METRO2' ? '/ m²' : '/ ud'}`
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    material.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {material.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    to={`/admin/materiales/${material.id}/editar`}
                    className="text-primary-600 hover:text-primary-900 mr-4"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDuplicate(material.id)}
                    className="text-gray-600 hover:text-gray-900 mr-4"
                  >
                    Duplicar
                  </button>
                  {material.activo && (
                    <button
                      onClick={() => handleDelete(material.id)}
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

        {materiales.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            No se encontraron materiales
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