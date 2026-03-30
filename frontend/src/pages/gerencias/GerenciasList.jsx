import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gerenciaService from '../../services/gerenciaService';

export default function GerenciasList() {
  const [gerencias, setGerencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGerencias();
  }, []);

  const loadGerencias = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await gerenciaService.getAll();
      setGerencias(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar gerencias');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Cargando gerencias...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gerencias</h1>
        <Link
          to="/admin/gerencias/nueva"
          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        >
          Nueva Gerencia
        </Link>
      </div>

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Áreas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {gerencias.map((gerencia) => (
              <tr key={gerencia.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {gerencia.nombre}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {gerencia.areas.length === 0 ? (
                    <span className="text-gray-400 italic">Sin áreas</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {gerencia.areas.map(({ area }) => (
                        <span
                          key={area.id}
                          className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded"
                        >
                          {area.nombre}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    gerencia.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {gerencia.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    to={`/admin/gerencias/${gerencia.id}/editar`}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent md:hidden" />
        </div>

        {gerencias.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            No hay gerencias creadas
          </div>
        )}
      </div>
    </div>
  );
}
