import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import materialService from '../../services/materialService';
import establecimientoService from '../../services/establecimientoService';
import solicitudService from '../../services/solicitudService';
import { nombreCompleto, ESTADO_SOLICITUD_CLASSES } from '../../utils/constants';

export default function Dashboard() {
  const { user } = useAuthStore();

  const [stats, setStats] = useState({
    materiales:      null,
    establecimientos: null,
    solicitudesPendientes: null,
    solicitudesHoy: null,
  });
  const [solicitudesRecientes, setSolicitudesRecientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [materialesRes, establecimientosRes, solicitudesRes, pendientesRes] = await Promise.all([
        materialService.getAll({ limit: 1 }),
        establecimientoService.getAll({ limit: 1 }),
        solicitudService.getAll({ limit: 5, order: 'desc' }),
        solicitudService.getAll({ limit: 1, estado: 'PENDIENTE' }),
      ]);

      setStats({
        materiales:            materialesRes.pagination?.total ?? '-',
        establecimientos:      establecimientosRes.pagination?.total ?? '-',
        solicitudesPendientes: pendientesRes.pagination?.total ?? '-',
        solicitudesHoy:        null,
      });

      setSolicitudesRecientes(solicitudesRes.data || []);
    } catch {
      // Si falla, los stats quedan en null (se muestra '-')
    } finally {
      setLoading(false);
    }
  };

  const ESTADO_LABEL = {
    PENDIENTE:      'Pendiente',
    RECHAZADA:      'Rechazada',
    EN_FABRICACION: 'En fabricación',
    COMPLETADA:     'Completada',
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {user.nombre}
        </h1>
        <p className="text-gray-500 mt-1">Panel de administración</p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500 mb-1">Materiales</p>
          <p className="text-3xl font-bold text-primary-600">
            {loading ? '...' : stats.materiales ?? '-'}
          </p>
          <Link to="/admin/materiales" className="text-xs text-primary-500 hover:underline mt-2 block">
            Ver catálogo →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500 mb-1">Establecimientos</p>
          <p className="text-3xl font-bold text-blue-600">
            {loading ? '...' : stats.establecimientos ?? '-'}
          </p>
          <Link to="/admin/establecimientos" className="text-xs text-blue-500 hover:underline mt-2 block">
            Ver establecimientos →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500 mb-1">Solicitudes pendientes</p>
          <p className="text-3xl font-bold text-yellow-600">
            {loading ? '...' : stats.solicitudesPendientes ?? '-'}
          </p>
          <Link to="/admin/solicitudes?estado=PENDIENTE" className="text-xs text-yellow-500 hover:underline mt-2 block">
            Ver pendientes →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500 mb-1">Total solicitudes</p>
          <p className="text-3xl font-bold text-green-600">
            {loading ? '...' : '-'}
          </p>
          <Link to="/admin/solicitudes" className="text-xs text-green-500 hover:underline mt-2 block">
            Ver todas →
          </Link>
        </div>
      </div>

      {/* Solicitudes recientes */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Solicitudes recientes</h2>
          <Link to="/admin/solicitudes" className="text-sm text-primary-600 hover:underline">
            Ver todas
          </Link>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-center text-gray-400">Cargando...</div>
        ) : solicitudesRecientes.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400">No hay solicitudes todavía</div>
        ) : (
          <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Establecimiento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Importe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {solicitudesRecientes.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {s.usuario ? nombreCompleto(s.usuario) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {s.material?.nombre || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {s.establecimiento?.nombre || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {s.importeTotal != null ? `${s.importeTotal.toFixed(2)} €` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ESTADO_SOLICITUD_CLASSES[s.estado] || 'bg-gray-100 text-gray-800'}`}>
                      {ESTADO_LABEL[s.estado] || s.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}