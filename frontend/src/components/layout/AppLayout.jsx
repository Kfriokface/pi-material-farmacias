import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import solicitudService from '../../services/solicitudService';
import PwaInstallModal from '../PwaInstallModal';
import MantenimientoGuard from '../MantenimientoGuard';

export default function AppLayout({ children }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  const [presupuestoBadge, setPresupuestoBadge] = useState(null);

  useEffect(() => {
    if (user?.rol !== 'ADMIN' && user?.areaId) {
      solicitudService.getPresupuesto(null, 0)
        .then(res => setPresupuestoBadge(res.data))
        .catch(() => {});
    }
  }, [user]);

  const nombreUsuario = user?.apellido1
    ? `${user.apellido1}${user.apellido2 ? ' ' + user.apellido2 : ''}, ${user.nombre}`
    : user?.nombre || user?.email;

  return (
    <MantenimientoGuard>
    <div className="h-screen flex flex-col bg-gray-50">
      <PwaInstallModal />
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Material Farmacias</h1>
              <p className="text-sm text-gray-500">{nombreUsuario}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-6">
          {children}
        </div>
      </main>

      {/* Navegación inferior */}
      <nav className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex justify-around items-center max-w-6xl mx-auto">
          <Link
            to="/app/materiales"
            className={`flex flex-col items-center px-4 py-3 rounded-lg transition ${
              isActive('/app/materiales')
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg className="w-7 h-7 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-xs font-medium">Catálogo</span>
          </Link>

          <Link
            to="/app/solicitudes"
            className={`flex flex-col items-center px-4 py-3 rounded-lg transition ${
              isActive('/app/solicitudes')
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg className="w-7 h-7 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs font-medium">Solicitudes</span>
          </Link>

          {user?.rol !== 'ADMIN' && (
            <Link
              to="/app/control-gasto"
              className={`relative flex flex-col items-center px-4 py-3 rounded-lg transition ${
                isActive('/app/control-gasto')
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {/* Dot badge */}
              {presupuestoBadge?.limite > 0 && (
                <span className={`absolute top-2 right-3 w-2 h-2 rounded-full ${
                  presupuestoBadge.disponibleNeto < 0 ? 'bg-red-500' :
                  presupuestoBadge.disponibleNeto < presupuestoBadge.limite * 0.2 ? 'bg-amber-400' :
                  ''
                }`} />
              )}
              <svg className="w-7 h-7 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-xs font-medium">Presupuesto</span>
            </Link>
          )}

          <Link
            to="/app/perfil"
            className={`flex flex-col items-center px-4 py-3 rounded-lg transition ${
              isActive('/app/perfil')
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg className="w-7 h-7 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs font-medium">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
    </MantenimientoGuard>
  );
}