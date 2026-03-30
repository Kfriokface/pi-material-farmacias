import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import proveedorService from '../../services/proveedorService';
import useAuthStore from '../../store/authStore';

export default function ProveedoresList() {
  const { user } = useAuthStore();
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [activoFilter, setActivoFilter] = useState('');

  useEffect(() => {
    loadProveedores();
  }, [page, search, activoFilter]);

  const loadProveedores = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 20 };
      if (search.trim()) params.search = search;
      if (activoFilter !== '') params.activo = activoFilter;
      const response = await proveedorService.getAll(params);
      setProveedores(response.data);
      if (response.pagination) setTotalPages(response.pagination.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadProveedores();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este proveedor?')) return;
    try {
      await proveedorService.delete(id);
      loadProveedores();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar proveedor');
    }
  };

  if (loading && proveedores.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Cargando proveedores...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
      </div>

      <form onSubmit={handleSearch} className="mb-6 flex flex-col sm:flex-row sm:flex-wrap md:flex-nowrap gap-2">
        <input
          type="text"
          placeholder="Buscar por nombre o contacto..."
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
        {user?.rol === 'ADMIN' && (
          <Link to="/admin/proveedores/nuevo" className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 text-center whitespace-nowrap">Nuevo Proveedor</Link>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {proveedores.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {p.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {p.email1
                    ? <a href={`mailto:${p.email1}`} className="hover:underline">{p.email1}</a>
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {p.telefono || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {p.contacto || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${p.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {user?.rol === 'ADMIN' && (
                    <>
                      <Link
                        to={`/admin/proveedores/${p.id}/editar`}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        Editar
                      </Link>
                      {p.activo && (
                        <button
                          onClick={() => handleDelete(p.id)}
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

        {proveedores.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            No hay proveedores
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