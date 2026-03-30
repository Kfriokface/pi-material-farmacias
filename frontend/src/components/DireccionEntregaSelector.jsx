import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import agendaService from '../services/agendaService';
import AddressFields from './AddressFields';

/**
 * Selector de dirección de entrega para el formulario de solicitud.
 *
 * Props:
 *   user        — objeto usuario autenticado (con direccion, zona.gerencias, etc.)
 *   onChange    — callback({ origen, agendaDireccionId, direccion, codigoPostal, localidad, provincia })
 */
export default function DireccionEntregaSelector({ user, onChange }) {
  const [agenda, setAgenda]               = useState([]);
  const [opcion, setOpcion]               = useState(null); // 'perfil' | 'gerencia' | `agenda-{id}` | 'nueva'
  const [nuevaDireccion, setNuevaDireccion] = useState({ direccion: '', codigoPostal: '', localidad: '', provincia: '' });
  const [guardarEnAgenda, setGuardarEnAgenda] = useState(false);
  const [nombreAgenda, setNombreAgenda]   = useState('');
  const [guardando, setGuardando]         = useState(false);

  // Gerencia del usuario (si tiene área con gerencia asignada)
  const gerencia = user?.area?.gerencias?.[0]?.gerencia || null;

  // Dirección de perfil completa (los 4 campos obligatorios)
  const perfilCompleto = user?.direccion && user?.codigoPostal && user?.localidad && user?.provincia;

  useEffect(() => {
    agendaService.getAll().then(res => setAgenda(res.data || [])).catch(() => {});
  }, []);

  // Cuando cambia la opción o la nueva dirección, notificar al padre
  useEffect(() => {
    if (!opcion) {
      onChange(null);
      return;
    }

    if (opcion === 'perfil') {
      onChange({
        origen: 'PERFIL',
        agendaDireccionId: null,
        direccion:    user.direccion,
        codigoPostal: user.codigoPostal,
        localidad:    user.localidad,
        provincia:    user.provincia,
      });
      return;
    }

    if (opcion === 'gerencia') {
      onChange({
        origen: 'GERENCIA',
        agendaDireccionId: null,
        direccion:    gerencia.direccion,
        codigoPostal: gerencia.codigoPostal,
        localidad:    gerencia.localidad,
        provincia:    gerencia.provincia,
      });
      return;
    }

    if (opcion.startsWith('agenda-')) {
      const id = parseInt(opcion.replace('agenda-', ''));
      const dir = agenda.find(d => d.id === id);
      if (dir) {
        onChange({
          origen: 'AGENDA',
          agendaDireccionId: id,
          direccion:    dir.direccion,
          codigoPostal: dir.codigoPostal,
          localidad:    dir.localidad,
          provincia:    dir.provincia,
        });
      }
      return;
    }

    if (opcion === 'nueva') {
      const { direccion, codigoPostal, localidad, provincia } = nuevaDireccion;
      const completa = direccion && codigoPostal && localidad && provincia;
      onChange(completa ? {
        origen: 'NUEVA',
        agendaDireccionId: null,
        direccion,
        codigoPostal,
        localidad,
        provincia,
      } : null);
    }
  }, [opcion, nuevaDireccion]);

  const handleGuardarEnAgenda = async () => {
    if (!nombreAgenda.trim()) return;
    setGuardando(true);
    try {
      const res = await agendaService.create({
        nombre:       nombreAgenda.trim(),
        direccion:    nuevaDireccion.direccion,
        codigoPostal: nuevaDireccion.codigoPostal,
        localidad:    nuevaDireccion.localidad,
        provincia:    nuevaDireccion.provincia,
      });
      const nueva = res.data;
      setAgenda(prev => [...prev, nueva]);
      setOpcion(`agenda-${nueva.id}`);
      setGuardarEnAgenda(false);
      setNombreAgenda('');
    } catch {
      // silencioso — la solicitud sigue adelante aunque no se guarde
    } finally {
      setGuardando(false);
    }
  };

  const renderDireccion = (dir) => (
    <p className="text-sm text-gray-600 mt-1">
      {dir.direccion}, {dir.codigoPostal} {dir.localidad} ({dir.provincia})
    </p>
  );

  const opcionClass = (value) =>
    `flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
      opcion === value
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200 hover:border-gray-300'
    }`;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">Dirección de entrega</p>

      {/* Perfil */}
      {perfilCompleto ? (
        <label className={opcionClass('perfil')}>
          <input type="radio" name="origen" value="perfil" checked={opcion === 'perfil'}
            onChange={() => setOpcion('perfil')} className="mt-0.5" />
          <div>
            <span className="text-sm font-medium text-gray-800">Mi dirección</span>
            {renderDireccion(user)}
            <p className="text-xs text-gray-400 mt-0.5">
              ¿Quieres cambiarla?{' '}
              <Link to="/app/perfil" className="text-blue-500 underline">Accede a tu perfil</Link>.
            </p>
          </div>
        </label>
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          No tienes dirección completa en tu perfil.{' '}
          <Link to="/app/perfil" className="underline font-medium">Complétala aquí</Link>{' '}
          para poder seleccionarla como dirección de envío.
        </div>
      )}

      {/* Gerencia */}
      {gerencia?.direccion && (
        <label className={opcionClass('gerencia')}>
          <input type="radio" name="origen" value="gerencia" checked={opcion === 'gerencia'}
            onChange={() => setOpcion('gerencia')} className="mt-0.5" />
          <div>
            <span className="text-sm font-medium text-gray-800">{gerencia.nombre}</span>
            {renderDireccion(gerencia)}
          </div>
        </label>
      )}

      {/* Agenda y "Otra dirección" — solo si el perfil está completo */}
      {perfilCompleto && agenda.map(dir => (
        <label key={dir.id} className={opcionClass(`agenda-${dir.id}`)}>
          <input type="radio" name="origen" value={`agenda-${dir.id}`}
            checked={opcion === `agenda-${dir.id}`}
            onChange={() => setOpcion(`agenda-${dir.id}`)} className="mt-0.5" />
          <div>
            <span className="text-sm font-medium text-gray-800">{dir.nombre}</span>
            {renderDireccion(dir)}
          </div>
        </label>
      ))}

      {perfilCompleto && (
        <label className={opcionClass('nueva')}>
          <input type="radio" name="origen" value="nueva" checked={opcion === 'nueva'}
            onChange={() => setOpcion('nueva')} className="mt-0.5" />
          <span className="text-sm font-medium text-gray-800">Otra dirección</span>
        </label>
      )}

      {/* Formulario nueva dirección */}
      {opcion === 'nueva' && (
        <div className="ml-6 space-y-4 pt-2">
          <AddressFields
            values={nuevaDireccion}
            onChange={setNuevaDireccion}
          />

          {/* Guardar en agenda */}
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={guardarEnAgenda}
              onChange={e => setGuardarEnAgenda(e.target.checked)} />
            Guardar esta dirección en mi agenda
          </label>

          {guardarEnAgenda && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nombre para identificarla (ej: Oficina, Casa...)"
                value={nombreAgenda}
                onChange={e => setNombreAgenda(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleGuardarEnAgenda}
                disabled={!nombreAgenda.trim() || guardando}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
