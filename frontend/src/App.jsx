import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useRegisterSW } from 'virtual:pwa-register/react';
import SplashScreen from './components/SplashScreen';

// Auth
import Login from './pages/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import AppLayout from './components/layout/AppLayout';

// Admin pages
import Dashboard from './pages/dashboard/Dashboard';
import MaterialesList from './pages/materiales/MaterialesList';
import MaterialForm from './pages/materiales/MaterialForm';
import MarcasList from './pages/marcas/MarcasList';
import MarcaForm from './pages/marcas/MarcaForm';
import EstablecimientosList from './pages/establecimientos/EstablecimientosList';
import EstablecimientoForm from './pages/establecimientos/EstablecimientoForm';
import ProveedoresList from './pages/proveedores/ProveedoresList';
import ProveedorForm from './pages/proveedores/ProveedorForm';
import AreasList from './pages/areas/AreasList';
import AreaForm from './pages/areas/AreaForm';
import GerenciasList from './pages/gerencias/GerenciasList';
import GerenciaForm from './pages/gerencias/GerenciaForm';
import UsuariosList from './pages/usuarios/UsuariosList';
import UsuarioForm from './pages/usuarios/UsuarioForm';
import SolicitudesList from './pages/solicitudes/SolicitudesList';
import SolicitudDetail from './pages/solicitudes/SolicitudDetail';
import Configuracion from './pages/configuracion/Configuracion';
import AdminSolicitudForm from './pages/solicitudes/AdminSolicitudForm';

// App pages (delegado + gerente + admin)
import AppMaterialesCatalogo from './pages/app/AppMaterialesCatalogo';
import AppSolicitudForm from './pages/app/AppSolicitudForm';
import AppSolicitudesList from './pages/app/AppSolicitudesList';
import AppPerfil from './pages/app/AppPerfil';
import AppControlGasto from './pages/app/AppControlGasto';

// Store
import useAuthStore from './store/authStore';
import useTokenValidation from './hooks/useTokenValidation';

function UpdateBanner() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-4 rounded-xl bg-primary-600 px-5 py-4 text-white shadow-lg md:left-auto md:right-6 md:w-96">
      <span className="text-sm font-medium">
        Nueva versión disponible
      </span>
      <button
        onClick={() => updateServiceWorker(true)}
        className="shrink-0 rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-primary-600 hover:bg-primary-50 transition"
      >
        Actualizar
      </button>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuthStore();

  useTokenValidation();

  const defaultRedirect = () => {
    if (!isAuthenticated) return '/login';
    if (user?.rol === 'ADMIN') return '/admin/dashboard';
    return '/app/materiales';
  };

  return (
    <Routes>
      {/* Ruta pública */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={defaultRedirect()} replace /> : <Login />}
      />

      {/* ================================================
          RUTAS ADMIN — solo ADMIN
      ================================================ */}
      <Route path="/admin">
        <Route
          path="dashboard"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminLayout><Dashboard /></AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* MATERIALES */}
        <Route path="materiales/nuevo" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout><MaterialForm /></AdminLayout></ProtectedRoute>} />
        <Route path="materiales/:id/editar" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout><MaterialForm /></AdminLayout></ProtectedRoute>} />
        <Route path="materiales" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout><MaterialesList /></AdminLayout></ProtectedRoute>} />

        {/* MARCAS */}
        <Route path="marcas/nueva" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout><MarcaForm /></AdminLayout></ProtectedRoute>} />
        <Route path="marcas/:id/editar" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout><MarcaForm /></AdminLayout></ProtectedRoute>} />
        <Route path="marcas" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout><MarcasList /></AdminLayout></ProtectedRoute>} />

        {/* ESTABLECIMIENTOS */}
        <Route path="establecimientos/nuevo" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout><EstablecimientoForm /></AdminLayout></ProtectedRoute>} />
        <Route path="establecimientos/:id/editar" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout><EstablecimientoForm /></AdminLayout></ProtectedRoute>} />
        <Route path="establecimientos" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout><EstablecimientosList /></AdminLayout></ProtectedRoute>} />

        {/* PROVEEDORES */}
        <Route path="proveedores/nuevo" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout><ProveedorForm /></AdminLayout></ProtectedRoute>} />
        <Route path="proveedores/:id/editar" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout><ProveedorForm /></AdminLayout></ProtectedRoute>} />
        <Route path="proveedores" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout><ProveedoresList /></AdminLayout></ProtectedRoute>} />

        {/* ÁREAS */}
        <Route path="areas/nueva" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout><AreaForm /></AdminLayout></ProtectedRoute>} />
        <Route path="areas/:id/editar" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout><AreaForm /></AdminLayout></ProtectedRoute>} />
        <Route path="areas" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout><AreasList /></AdminLayout></ProtectedRoute>} />

        {/* GERENCIAS */}
        <Route path="gerencias/nueva" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout><GerenciaForm /></AdminLayout></ProtectedRoute>} />
        <Route path="gerencias/:id/editar" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout><GerenciaForm /></AdminLayout></ProtectedRoute>} />
        <Route path="gerencias" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout><GerenciasList /></AdminLayout></ProtectedRoute>} />

        {/* SOLICITUDES */}
        <Route path="solicitudes/nueva" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout><AdminSolicitudForm /></AdminLayout></ProtectedRoute>} />
        <Route path="solicitudes/:id" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout><SolicitudDetail /></AdminLayout></ProtectedRoute>} />
        <Route path="solicitudes" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout><SolicitudesList /></AdminLayout></ProtectedRoute>} />

        {/* USUARIOS */}
        <Route path="usuarios/:id/editar" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout><UsuarioForm /></AdminLayout></ProtectedRoute>} />
        <Route path="usuarios" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout><UsuariosList /></AdminLayout></ProtectedRoute>} />

        {/* CONFIGURACIÓN */}
        <Route path="configuracion" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout><Configuracion /></AdminLayout></ProtectedRoute>} />
      </Route>

      {/* ================================================
          RUTAS APP — Delegado + Gerente + Admin
      ================================================ */}
      <Route path="/app">
        <Route path="materiales" element={<ProtectedRoute roles={['ADMIN', 'GERENTE', 'DELEGADO']}><AppLayout><AppMaterialesCatalogo /></AppLayout></ProtectedRoute>} />
        <Route path="solicitudes" element={<ProtectedRoute roles={['ADMIN', 'GERENTE', 'DELEGADO']}><AppLayout><AppSolicitudesList /></AppLayout></ProtectedRoute>} />
        <Route path="solicitud/nueva" element={<ProtectedRoute roles={['ADMIN', 'GERENTE', 'DELEGADO']}><AppLayout><AppSolicitudForm /></AppLayout></ProtectedRoute>} />
        <Route path="control-gasto" element={<ProtectedRoute roles={['GERENTE', 'DELEGADO']}><AppLayout><AppControlGasto /></AppLayout></ProtectedRoute>} />
        <Route path="perfil" element={<ProtectedRoute roles={['ADMIN', 'GERENTE', 'DELEGADO']}><AppLayout><AppPerfil /></AppLayout></ProtectedRoute>} />
      </Route>

      {/* Redireccionamientos */}
      <Route path="/" element={<Navigate to={defaultRedirect()} replace />} />
      <Route path="*" element={<Navigate to={defaultRedirect()} replace />} />
    </Routes>
  );
}

function App() {
  const [showSplash] = useState(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (!isStandalone) return false;
    if (sessionStorage.getItem('mf_splash_shown')) return false;
    sessionStorage.setItem('mf_splash_shown', '1');
    return true;
  });

  const [splashDone, setSplashDone] = useState(!showSplash);

  return (
    <BrowserRouter>
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      <UpdateBanner />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
