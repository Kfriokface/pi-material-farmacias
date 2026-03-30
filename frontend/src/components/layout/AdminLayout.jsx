import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import AdminNav, { AdminMobileMenu } from './AdminNav';
import AdminFooter from './AdminFooter';

const APP_VERSION = __APP_VERSION__;

export default function AdminLayout({ children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const nombreUsuario = user?.apellido1
    ? `${user.apellido1}${user.apellido2 ? ' ' + user.apellido2 : ''}, ${user.nombre}`
    : user?.nombre || user?.email;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
                <h1 className="text-xl font-bold text-gray-900">Material Farmacias</h1>
              </div>
              <AdminNav rol={user?.rol} />
            </div>
            <div className="flex items-center space-x-4">
              <span className="hidden md:inline-flex text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                {user?.rol}
              </span>
              <button
                onClick={handleLogout}
                className="hidden md:block text-sm text-gray-600 hover:text-gray-900"
              >
                Salir
              </button>
              <AdminMobileMenu rol={user?.rol} nombreUsuario={nombreUsuario} onLogout={handleLogout} />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <AdminFooter />
    </div>
  );
}