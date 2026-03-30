const APP_VERSION = __APP_VERSION__;

export default function AdminFooter() {
  return (
    <footer className="mt-auto bg-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Italfarmaco. Todos los derechos reservados.
        </p>
        <p className="text-xs text-gray-500">v{APP_VERSION}</p>
      </div>
    </footer>
  );
}