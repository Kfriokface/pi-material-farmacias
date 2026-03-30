import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import areaService from '../../services/areaService';

export default function AreasList() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await areaService.getAll({ limit: 100 });
      setAreas(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar áreas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Cargando áreas...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Áreas</h1>
        <Link
          to="/admin/areas/nueva"
          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        >
          Nueva Área
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delegados</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {areas.map((area) => (
              <tr key={area.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {area.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {area._count?.usuarios ?? '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    to={`/admin/areas/${area.id}/editar`}
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

        {areas.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            No hay áreas creadas
          </div>
        )}
      </div>
    </div>
  );
}
