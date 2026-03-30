import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function DropdownMenu({ label, items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const location = useLocation();

  const isActive = items.some((item) => location.pathname.startsWith(item.to));

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 text-sm font-medium transition ${
          isActive ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        {label}
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={`block px-4 py-2 text-sm transition ${
                location.pathname.startsWith(item.to) ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function NavLink({ to, children, onClick }) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`text-sm font-medium transition ${isActive ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'}`}
    >
      {children}
    </Link>
  );
}

const ADMIN_LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/solicitudes', label: 'Solicitudes' },
  { to: '/admin/materiales', label: 'Materiales' },
  { to: '/admin/marcas', label: 'Marcas' },
  { to: '/admin/proveedores', label: 'Proveedores' },
  { to: '/admin/establecimientos', label: 'Establecimientos' },
  { to: '/admin/usuarios', label: 'Usuarios' },
  { to: '/admin/areas', label: 'Áreas' },
  { to: '/admin/gerencias', label: 'Gerencias' },
  { to: '/admin/configuracion', label: 'Configuración' },
];

const GERENTE_LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/solicitudes', label: 'Solicitudes' },
  { to: '/admin/establecimientos', label: 'Establecimientos' },
];

export function AdminMobileMenu({ rol, nombreUsuario, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const links = rol === 'GERENTE' ? GERENTE_LINKS : ADMIN_LINKS;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative md:hidden" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-gray-600 hover:text-gray-900"
        aria-label="Menú"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)}>
              <span className="block px-4 py-2 hover:bg-gray-50">{link.label}</span>
            </NavLink>
          ))}
          <div className="border-t border-gray-100 mt-1 pt-1">
            <div className="px-4 py-2 flex items-center gap-2">
              <span className="text-xs bg-primary-100 text-primary-800 px-2 py-0.5 rounded">{rol}</span>
              <span className="text-xs text-gray-500 truncate">{nombreUsuario}</span>
            </div>
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminNav({ rol }) {
  if (rol === 'GERENTE') {
    return (
      <nav className="hidden md:flex items-center space-x-6">
        <NavLink to="/admin/dashboard">Dashboard</NavLink>
        <NavLink to="/admin/solicitudes">Solicitudes</NavLink>
        <NavLink to="/admin/establecimientos">Establecimientos</NavLink>
      </nav>
    );
  }

  return (
    <nav className="hidden md:flex items-center space-x-6">
      <NavLink to="/admin/dashboard">Dashboard</NavLink>
      <NavLink to="/admin/solicitudes">Solicitudes</NavLink>
      <DropdownMenu
        label="Catálogo"
        items={[
          { to: '/admin/materiales', label: 'Materiales' },
          { to: '/admin/marcas', label: 'Marcas' },
          { to: '/admin/proveedores', label: 'Proveedores' },
        ]}
      />
      <DropdownMenu
        label="Sistema"
        items={[
          { to: '/admin/establecimientos', label: 'Establecimientos' },
          { to: '/admin/usuarios', label: 'Usuarios' },
          { to: '/admin/areas', label: 'Áreas' },
          { to: '/admin/gerencias', label: 'Gerencias' },
          { to: '/admin/configuracion', label: 'Configuración' },
        ]}
      />
    </nav>
  );
}
