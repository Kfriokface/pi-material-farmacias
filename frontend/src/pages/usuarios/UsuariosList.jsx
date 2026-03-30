import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import usuarioService from '../../services/usuarioService';
import areaService from '../../services/areaService';
import { ROLES_FILTRO, nombreCompleto } from '../../utils/constants';

const ROL_CLASSES = {
  ADMIN:    'bg-purple-100 text-purple-800',
  GERENTE:  'bg-blue-100   text-blue-800',
  DELEGADO: 'bg-green-100  text-green-800',
};

export default function UsuariosList() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [rolFilter, setRolFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    areaService.getAll({ limit: 100 }).then((r) => setAreas(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    loadUsuarios();
  }, [page, search, rolFilter, areaFilter]);

  const loadUsuarios = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 20 };
      if (search.trim()) params.search = search;
      if (rolFilter) params.rol = rolFilter;
      if (areaFilter) params.areaId = areaFilter;
      const response = await usuarioService.getAll(params);
      setUsuarios(response.data);
      if (response.pagination) setTotalPages(response.pagination.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadUsuarios();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de desactivar este usuario?')) return;
    try {
      await usuarioService.delete(id);
      loadUsuarios();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  if (loading && usuarios.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
      </div>

      <form onSubmit={handleSearch} className="mb-6 flex flex-col sm:flex-row sm:flex-wrap md:flex-nowrap gap-2">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          className="min-w-0 sm:basis-full md:flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="min-w-0 sm:flex-1 md:flex-none px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={rolFilter}
          onChange={(e) => { setRolFilter(e.target.value); setPage(1); }}
        >
          {ROLES_FILTRO.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <select
          className="min-w-0 sm:flex-1 md:flex-none px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={areaFilter}
          onChange={(e) => { setAreaFilter(e.target.value); setPage(1); }}
        >
          <option value="">Todas las áreas</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>{a.nombre}</option>
          ))}
        </select>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Área</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {nombreCompleto(usuario)}
                  </div>
                  <div className="text-sm text-gray-500">{usuario.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ROL_CLASSES[usuario.rol] || 'bg-gray-100 text-gray-800'}`}>
                    {usuario.rol}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {usuario.area?.nombre || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    usuario.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    to={`/admin/usuarios/${usuario.id}/editar`}
                    className="text-primary-600 hover:text-primary-900 mr-4"
                  >
                    Editar
                  </Link>
                  {usuario.activo && (
                    <button
                      onClick={() => handleDelete(usuario.id)}
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

        {usuarios.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            No se encontraron usuarios
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