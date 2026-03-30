import { useState, useEffect, useMemo } from 'react';
import solicitudService from '../../services/solicitudService';
import useAuthStore from '../../store/authStore';
import {
  ESTADOS_SOLICITUD_FILTRO,
  ESTADO_SOLICITUD_CLASSES,
  estadoLabel,
  nombreCompleto,
} from '../../utils/constants';

const CURRENT_YEAR = new Date().getFullYear();
const APP_START_YEAR = 2026;
const YEARS = Array.from({ length: CURRENT_YEAR - APP_START_YEAR + 1 }, (_, i) => CURRENT_YEAR - i);

export default function AppControlGasto() {
  const { user } = useAuthStore();
  const esGerente = user?.rol === 'GERENTE';

  const [anio, setAnio] = useState(CURRENT_YEAR);
  const [presupuesto, setPresupuesto] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtros (client-side)
  const [estadoFilter, setEstadoFilter] = useState('');
  const [establecimientoFilter, setEstablecimientoFilter] = useState('');
  const [solicitanteFilter, setSolicitanteFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');

  useEffect(() => {
    loadData();
  }, [anio]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    // Reset filtros al cambiar año
    setEstablecimientoFilter('');
    setSolicitanteFilter('');
    setEstadoFilter('');
    setTipoFilter('');
    try {
      const [presupuestoRes, solicitudesRes] = await Promise.all([
        solicitudService.getPresupuesto(null, 0),
        solicitudService.getAll({ anio, limit: 500, page: 1 }),
      ]);
      setPresupuesto(presupuestoRes.data);
      setSolicitudes(solicitudesRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // Opciones de filtros derivadas de las solicitudes cargadas
  const establecimientos = useMemo(() => {
    const map = new Map();
    solicitudes.forEach(s => {
      if (s.establecimiento) map.set(s.establecimiento.id, s.establecimiento);
    });
    return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [solicitudes]);

  const solicitantes = useMemo(() => {
    if (!esGerente) return [];
    const map = new Map();
    solicitudes.forEach(s => {
      if (s.usuario) map.set(s.usuario.id, s.usuario);
    });
    return Array.from(map.values()).sort((a, b) =>
      nombreCompleto(a).localeCompare(nombreCompleto(b))
    );
  }, [solicitudes, esGerente]);

  // Solicitudes filtradas (client-side)
  const filtradas = useMemo(() => {
    return solicitudes.filter(s => {
      if (estadoFilter && s.estado !== estadoFilter) return false;
      if (establecimientoFilter && s.establecimientoId !== parseInt(establecimientoFilter)) return false;
      if (solicitanteFilter && s.usuarioId !== parseInt(solicitanteFilter)) return false;
      if (tipoFilter && s.material?.tipoEstablecimiento !== tipoFilter) return false;
      return true;
    });
  }, [solicitudes, estadoFilter, establecimientoFilter, solicitanteFilter, tipoFilter]);

  const totalFiltrado = filtradas.reduce((sum, s) => sum + (s.importeTotal || 0), 0);

  // Barra de progreso
  const limite = presupuesto?.limite || 0;
  const gastado = presupuesto?.gastadoReal || 0;
  const comprometido = presupuesto?.comprometido || 0;
  const superado = presupuesto?.disponibleNeto < 0;
  const pctGastado = limite > 0 ? Math.min(100, (gastado / limite) * 100) : 0;
  const pctComprometido = limite > 0 ? Math.min(100 - pctGastado, (comprometido / limite) * 100) : 0;
  const pctTotal = limite > 0 ? Math.round(((gastado + comprometido) / limite) * 100) : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Control de Gasto</h1>
          <p className="text-gray-500 text-sm">Presupuesto del área · {anio}</p>
        </div>
        <select
          value={anio}
          onChange={e => setAnio(parseInt(e.target.value))}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white"
        >
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Tarjeta de presupuesto */}
      {presupuesto && (
        <div className={`bg-white rounded-xl shadow-sm p-5 mb-6 ${superado ? 'border border-red-300' : ''}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Presupuesto {anio}</p>
              {limite > 0 ? (
                <p className="text-2xl font-bold text-gray-900">
                  {gastado.toFixed(2)} €{' '}
                  <span className="text-base font-normal text-gray-400">/ {limite.toFixed(2)} €</span>
                </p>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{gastado.toFixed(2)} €</p>
              )}
              {limite === 0 && (
                <p className="text-xs text-gray-400 mt-1">Sin límite configurado</p>
              )}
            </div>
            {pctTotal !== null && (
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                superado ? 'bg-red-100 text-red-700' :
                pctTotal >= 80 ? 'bg-amber-100 text-amber-700' :
                'bg-green-100 text-green-700'
              }`}>
                {pctTotal}%
              </span>
            )}
          </div>

          {/* Barra de progreso */}
          {limite > 0 && (
            <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-5">
              <div
                className="absolute left-0 top-0 h-full bg-primary-500 transition-all"
                style={{ width: `${pctGastado}%` }}
              />
              <div
                className={`absolute top-0 h-full transition-all ${superado ? 'bg-red-400' : 'bg-amber-400'}`}
                style={{ left: `${pctGastado}%`, width: `${pctComprometido}%` }}
              />
            </div>
          )}

          {/* 4 valores */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                <p className="text-xs text-gray-500">Gastado real</p>
              </div>
              <p className="text-base font-bold text-gray-900">{gastado.toFixed(2)} €</p>
              <p className="text-xs text-gray-400 mt-0.5">En fabricación + completadas</p>
            </div>

            <div className="bg-amber-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                <p className="text-xs text-gray-500">Comprometido</p>
              </div>
              <p className="text-base font-bold text-amber-700">{comprometido.toFixed(2)} €</p>
              <p className="text-xs text-gray-400 mt-0.5">Solicitudes pendientes</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Disponible real</p>
              <p className={`text-base font-bold ${presupuesto.disponibleReal < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {presupuesto.disponibleReal.toFixed(2)} €
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Sin contar pendientes</p>
            </div>

            <div className={`rounded-xl p-3 ${presupuesto.disponibleNeto < 0 ? 'bg-red-50' : 'bg-green-50'}`}>
              <p className="text-xs text-gray-500 mb-1">Disponible neto</p>
              <p className={`text-base font-bold ${presupuesto.disponibleNeto < 0 ? 'text-red-600' : 'text-green-700'}`}>
                {presupuesto.disponibleNeto.toFixed(2)} €
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Restando pendientes</p>
            </div>
          </div>

          {/* Leyenda */}
          {limite > 0 && (
            <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-primary-500" />
                <span className="text-xs text-gray-400">Gastado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-amber-400" />
                <span className="text-xs text-gray-400">Comprometido</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-gray-200" />
                <span className="text-xs text-gray-400">Disponible</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        <select
          value={estadoFilter}
          onChange={e => setEstadoFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-full bg-white whitespace-nowrap flex-shrink-0"
        >
          {ESTADOS_SOLICITUD_FILTRO.map(e => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>

        {establecimientos.length > 0 && (
          <select
            value={establecimientoFilter}
            onChange={e => setEstablecimientoFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-full bg-white whitespace-nowrap flex-shrink-0"
          >
            <option value="">Todas las farmacias</option>
            {establecimientos.map(e => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>
        )}

        {esGerente && (
          <select
            value={tipoFilter}
            onChange={e => setTipoFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-full bg-white whitespace-nowrap flex-shrink-0"
          >
            <option value="">Farmacias y eventos</option>
            <option value="FARMACIA">Solo farmacias</option>
            <option value="EVENTO">Solo eventos</option>
          </select>
        )}

        {esGerente && solicitantes.length > 1 && (
          <select
            value={solicitanteFilter}
            onChange={e => setSolicitanteFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-full bg-white whitespace-nowrap flex-shrink-0"
          >
            <option value="">Todos los solicitantes</option>
            {solicitantes.map(u => (
              <option key={u.id} value={u.id}>{nombreCompleto(u)}</option>
            ))}
          </select>
        )}
      </div>

      {/* Resumen filtrado */}
      {!loading && (
        <p className="text-xs text-gray-400 mb-4">
          {filtradas.length} solicitud{filtradas.length !== 1 ? 'es' : ''}
          {filtradas.length !== solicitudes.length && ` (de ${solicitudes.length} en ${anio})`}
          {filtradas.length > 0 && ` · ${totalFiltrado.toFixed(2)} €`}
        </p>
      )}

      {/* Lista de solicitudes */}
      {loading ? (
        <div className="flex justify-center py-12">
          <p className="text-gray-400 text-sm">Cargando...</p>
        </div>
      ) : filtradas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">No hay solicitudes para los filtros seleccionados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtradas.map(s => (
            <div key={s.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex justify-between items-start gap-2 mb-1">
                <p className="font-medium text-gray-900 text-sm leading-snug">{s.material?.nombre}</p>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ${
                  ESTADO_SOLICITUD_CLASSES[s.estado] || 'bg-gray-100 text-gray-800'
                }`}>
                  {estadoLabel(s.estado)}
                </span>
              </div>

              <p className="text-sm text-gray-500 truncate">
                {s.establecimiento?.nombre || s.eventoNombre || '—'}
                {s.material?.tipoEstablecimiento === 'EVENTO' && (
                  <span className="ml-1.5 text-xs text-purple-500 font-medium">Evento</span>
                )}
              </p>

              {s.usuario && s.usuarioId !== user?.id && (
                <p className="text-xs text-primary-600 mt-0.5">
                  Solicitante: {s.usuario.rol === 'ADMIN' ? 'Administración' : nombreCompleto(s.usuario)}
                </p>
              )}

              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-400">
                  {new Date(s.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </p>
                {s.importeTotal != null && (
                  <p className="text-sm font-semibold text-gray-900">{s.importeTotal.toFixed(2)} €</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
