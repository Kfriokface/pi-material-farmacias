
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import materialService from '../../services/materialService';
import establecimientoService from '../../services/establecimientoService';
import solicitudService from '../../services/solicitudService';
import marcaService from '../../services/marcaService';
import usuarioService from '../../services/usuarioService';
import useAuthStore from '../../store/authStore';
import { TALLAS, LENGUAS } from '../../utils/constants';
import Lightbox from '../../components/Lightbox';
import DireccionEntregaSelector from '../../components/DireccionEntregaSelector';

const FILES_URL = import.meta.env.VITE_FILES_URL || 'http://localhost:3000/files';

export default function AppSolicitudForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const materialId = searchParams.get('materialId');
  const { user } = useAuthStore();

  const [material, setMaterial] = useState(null);
  const [establecimientos, setEstablecimientos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [gerentes, setGerentes] = useState([]);
  const [imputadoId, setImputadoId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState(false);



  // Aviso de presupuesto
  const [presupuesto, setPresupuesto] = useState(null);
  const [presupuestoLoading, setPresupuestoLoading] = useState(false);
  const [confirmandoLimite, setConfirmandoLimite] = useState(false);
  const [direccionEntrega, setDireccionEntrega] = useState(null);

  const [formData, setFormData] = useState({
    establecimientoId:       '',
    altoCm:                  '',
    anchoCm:                 '',
    orientacion:             '',
    lenguaPersonalizacion:   '',
    talla:                   '',
    personalizacionBata:     '',
    marcaId:                 '',
    observaciones:           '',
  });

  useEffect(() => {
    if (materialId) {
      loadData();
    } else {
      setError('No se especificó el material');
      setLoading(false);
    }
  }, [materialId]);

  // Consultar presupuesto cuando hay establecimiento seleccionado (o material de evento con imputado elegido)
  useEffect(() => {
    const puedeConsultar = material && (
      formData.establecimientoId ||
      (esEvento && user?.rol !== 'ADMIN') ||
      (esEvento && user?.rol === 'ADMIN' && imputadoId)
    );
    if (puedeConsultar) {
      consultarPresupuesto();
    } else {
      setPresupuesto(null);
    }
  }, [formData.establecimientoId, material, imputadoId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const materialRes = await materialService.getById(materialId);
      const mat = materialRes.data;
      setMaterial(mat);

      // Cargar establecimientos (solo se usan si el material no es de tipo EVENTO)
      const establecimientosRes = await establecimientoService.getAll({
        limit: 500,
        tipo: user?.rol === 'DELEGADO' ? 'FARMACIA' : undefined,
      });
      setEstablecimientos(establecimientosRes.data);

      // Cargar marcas si el material permite selección de marca y no tiene marca fija
      if (mat.permiteMarca && !mat.marcaId) {
        const marcasRes = await marcaService.getAll({ limit: 100 });
        setMarcas(marcasRes.data || []);
      }

      // Admin: cargar gerentes para el selector de imputación en eventos
      if (user?.rol === 'ADMIN' && mat.tipoEstablecimiento === 'EVENTO') {
        const gerentesRes = await usuarioService.getAll({ rol: 'GERENTE', limit: 200, activo: true });
        setGerentes(gerentesRes.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const consultarPresupuesto = async () => {
    setPresupuestoLoading(true);
    try {
      const importe = calcularImporte();

      // Derivar areaId para la consulta
      let areaId = null;
      if (user?.rol === 'ADMIN') {
        if (esEvento) {
          // Para admin+evento, necesitamos el gerente seleccionado
          if (imputadoId) {
            const gerente = gerentes.find(g => g.id === parseInt(imputadoId));
            areaId = gerente?.areaId || null;
          }
        } else if (formData.establecimientoId) {
          const est = establecimientos.find(e => e.id === parseInt(formData.establecimientoId));
          areaId = est?.areaId || null;
        }
      }
      // Para gerente/delegado el backend usa req.user.areaId directamente

      const res = await solicitudService.getPresupuesto(areaId, importe);
      setPresupuesto(res.data);
    } catch {
      setPresupuesto(null);
    } finally {
      setPresupuestoLoading(false);
    }
  };

  const calcularImporte = () => {
    if (!material) return 0;
    return material.precioPublico || 0;
  };

  const importeTotal = calcularImporte();
  const hayAvisosPresupuesto = presupuesto?.superaDisponibleNeto;

  const esEvento = material?.tipoEstablecimiento === 'EVENTO';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Si hay avisos y aún no ha confirmado, mostrar confirmación
    if (hayAvisosPresupuesto && !confirmandoLimite) {
      setConfirmandoLimite(true);
      return;
    }

    if (!direccionEntrega) {
      setError('Debes seleccionar una dirección de entrega. Completa tu dirección en el perfil para continuar.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const solicitudData = {
        materialId: parseInt(materialId),
        importeTotal,
        observaciones: formData.observaciones || null,
        ...(material.permiteAltoAncho && {
          altoCm:      formData.altoCm     ? parseInt(formData.altoCm)     : null,
          anchoCm:     formData.anchoCm    ? parseInt(formData.anchoCm)    : null,
          orientacion: material.orientacion || formData.orientacion || null,
        }),
        ...(material.permitePersonalizar && {
          lenguaPersonalizacion: formData.lenguaPersonalizacion || null,
        }),
        ...(material.permiteTalla && {
          talla: formData.talla || null,
        }),
        ...(material.permitePersonalizacionBata && {
          personalizacionBata: formData.personalizacionBata || null,
        }),
        ...(material.permiteMarca && !material.marcaId && {
          marcaId: formData.marcaId ? parseInt(formData.marcaId) : null,
        }),
      };

      // Establecimiento (solo si no es evento)
      if (!esEvento) {
        solicitudData.establecimientoId = parseInt(formData.establecimientoId);
      }

      // imputadoId (solo admin + evento)
      if (esEvento && user?.rol === 'ADMIN' && imputadoId) {
        solicitudData.imputadoId = parseInt(imputadoId);
      }

      // Dirección de entrega
      if (direccionEntrega) {
        solicitudData.origenDireccion        = direccionEntrega.origen;
        solicitudData.agendaDireccionId      = direccionEntrega.agendaDireccionId || null;
        solicitudData.direccionEntrega       = direccionEntrega.direccion;
        solicitudData.codigoPostalEntrega    = direccionEntrega.codigoPostal;
        solicitudData.localidadEntrega       = direccionEntrega.localidad;
        solicitudData.provinciaEntrega       = direccionEntrega.provincia;
      }

      const creada = await solicitudService.create(solicitudData);
      const solicitudId = creada.data?.id;

      navigate('/app/solicitudes');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear solicitud');
      setConfirmandoLimite(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (error && !material) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nueva Solicitud</h1>
        <p className="text-gray-600">Completa los datos para solicitar este material</p>
      </div>

      {/* Material seleccionado */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex gap-6">
          {material.imagen && (
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <img
                src={`${FILES_URL}/${material.imagen}`}
                alt={material.nombre}
                className="w-32 h-32 object-cover rounded-lg"
              />
              {material.imagenZoom && (
                <button
                  type="button"
                  onClick={() => setLightbox(true)}
                  className="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0zm-6-3v6m-3-3h6" />
                  </svg>
                  Ampliar
                </button>
              )}
            </div>
          )}
          {lightbox && <Lightbox src={`${FILES_URL}/${material.imagenZoom}`} alt={material.nombre} onClose={() => setLightbox(false)} />}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">{material.nombre}</h2>
            <p className="text-sm text-gray-500 mb-2">{material.codigo}</p>
            {material.marca && (
              <span className="inline-block bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded mb-2">
                {material.marca.nombre}
              </span>
            )}
            {material.descripcion && (
              <p className="text-gray-600 mb-3">{material.descripcion}</p>
            )}
            {material.precioPublico && (
              <p className="text-sm text-gray-500">
                {material.precioPublico.toFixed(2)} € / unidad
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Aviso de presupuesto */}
      {presupuesto && (
        <div className={`border px-4 py-4 rounded-xl mb-6 ${hayAvisosPresupuesto ? 'bg-yellow-50 border-yellow-300 text-yellow-800' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
          <p className="font-semibold mb-3">Presupuesto del área</p>
          <div className="grid grid-cols-2 gap-2 text-sm mb-2">
            <span className="text-gray-500">Límite total</span>
            <span className="font-medium text-right">{presupuesto.limite?.toFixed(2)} €</span>
            <span className="text-gray-500">Gastado real</span>
            <span className="font-medium text-right">{presupuesto.gastadoReal?.toFixed(2)} €</span>
            <span className="text-gray-500">Comprometido</span>
            <span className="font-medium text-right">{presupuesto.comprometido?.toFixed(2)} €</span>
            <span className="text-gray-500">Disponible neto</span>
            <span className={`font-bold text-right ${presupuesto.disponibleNeto < 0 ? 'text-red-600' : 'text-green-700'}`}>
              {presupuesto.disponibleNeto?.toFixed(2)} €
            </span>
          </div>
          {hayAvisosPresupuesto && (
            <p className="text-sm font-medium mt-2">
              Esta solicitud superaría el disponible neto del área. Puedes enviarla igualmente — negocio decidirá si se fabrica.
            </p>
          )}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">

          {/* Establecimiento o aviso de evento */}
          {esEvento ? (
            <div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4">
                <p className="text-sm font-medium text-blue-800">Material para eventos</p>
                <p className="text-sm text-blue-600 mt-1">Este material se solicita sin establecimiento asociado.</p>
              </div>
              {user?.rol === 'ADMIN' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imputar gasto a <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={imputadoId}
                    onChange={(e) => setImputadoId(e.target.value)}
                  >
                    <option value="">Seleccionar gerente...</option>
                    {gerentes.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.nombre} {g.apellido1} {g.apellido2 || ''} — {g.area?.nombre || 'Sin área'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label htmlFor="establecimientoId" className="block text-sm font-medium text-gray-700 mb-2">
                Establecimiento <span className="text-red-500">*</span>
              </label>
              <select
                id="establecimientoId"
                name="establecimientoId"
                required
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.establecimientoId}
                onChange={handleChange}
              >
                <option value="">Seleccionar establecimiento...</option>
                {establecimientos.map((est) => (
                  <option key={est.id} value={est.id}>
                    {est.nombre} — {est.localidad}
                  </option>
                ))}
              </select>
              {presupuestoLoading && (
                <p className="text-xs text-gray-400 mt-1">Consultando presupuesto...</p>
              )}
            </div>
          )}

          {/* Alto, Ancho y Orientación (si permiteAltoAncho) */}
          {material.permiteAltoAncho && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="altoCm" className="block text-sm font-medium text-gray-700 mb-2">
                    Alto (cm) <span className="text-red-500">*</span>
                    {material.altoMaxCm && (
                      <span className="text-gray-400 font-normal ml-1">(máx. {material.altoMaxCm} cm)</span>
                    )}
                  </label>
                  <input
                    type="number" id="altoCm" name="altoCm" min="1"
                    max={material.altoMaxCm || undefined}
                    required
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.altoCm} onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="anchoCm" className="block text-sm font-medium text-gray-700 mb-2">
                    Ancho (cm) <span className="text-red-500">*</span>
                    {material.anchoMaxCm && (
                      <span className="text-gray-400 font-normal ml-1">(máx. {material.anchoMaxCm} cm)</span>
                    )}
                  </label>
                  <input
                    type="number" id="anchoCm" name="anchoCm" min="1"
                    max={material.anchoMaxCm || undefined}
                    required
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.anchoCm} onChange={handleChange}
                  />
                </div>
              </div>
              {material.orientacion ? (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-3">
                  <span className="font-medium">Orientación:</span>
                  <span>
                    {material.orientacion === 'HORIZONTAL' ? 'Horizontal' :
                     material.orientacion === 'VERTICAL'   ? 'Vertical'   : 'Cuadrado'}
                  </span>
                </div>
              ) : (
                <div>
                  <label htmlFor="orientacion" className="block text-sm font-medium text-gray-700 mb-2">
                    Orientación
                  </label>
                  <select
                    id="orientacion" name="orientacion"
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.orientacion} onChange={handleChange}
                  >
                    <option value="">Sin especificar</option>
                    <option value="HORIZONTAL">Horizontal</option>
                    <option value="VERTICAL">Vertical</option>
                    <option value="CUADRADO">Cuadrado</option>
                  </select>
                </div>
              )}
            </>
          )}

          {/* Marca (genérico, solo si el material tiene permiteMarca y no tiene marca fija) */}
          {material.permiteMarca && !material.marcaId && (
            <div>
              <label htmlFor="marcaId" className="block text-sm font-medium text-gray-700 mb-2">
                Marca
              </label>
              <select
                id="marcaId" name="marcaId"
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.marcaId} onChange={handleChange}
              >
                <option value="">Sin especificar</option>
                {marcas.map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>
          )}

          {/* Talla */}
          {material.permiteTalla && (
            <div>
              <label htmlFor="talla" className="block text-sm font-medium text-gray-700 mb-2">
                Talla <span className="text-red-500">*</span>
              </label>
              <select
                id="talla" name="talla" required
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.talla} onChange={handleChange}
              >
                <option value="">Seleccionar talla...</option>
                {TALLAS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Personalización de idioma */}
          {material.permitePersonalizar && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idioma del material <span className="text-red-500">*</span>
              </label>
              <select
                name="lenguaPersonalizacion"
                required
                value={formData.lenguaPersonalizacion}
                onChange={handleChange}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="">Seleccionar idioma...</option>
                {(material.lenguas ? material.lenguas.split(',') : []).map(val => {
                  const l = LENGUAS.find(x => x.value === val);
                  return l ? <option key={l.value} value={l.value}>{l.label}</option> : null;
                })}
              </select>
              <p className="text-xs text-gray-400 mt-1">El material se fabricará en el idioma seleccionado.</p>
            </div>
          )}

          {/* Personalización de prenda */}
          {material.permitePersonalizacionBata && (
            <div>
              <label htmlFor="personalizacionBata" className="block text-sm font-medium text-gray-700 mb-2">
                Texto para bordar en la prenda <span className="text-red-500">*</span>
              </label>
              <input
                type="text" id="personalizacionBata" name="personalizacionBata"
                required maxLength={100}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ej: Ldo. Fernando Marín"
                value={formData.personalizacionBata} onChange={handleChange}
              />
              <p className="text-xs text-amber-600 mt-1">Este texto se mandará a fabricar exactamente como lo escribes. Los errores corren a tu cargo.</p>
            </div>
          )}

          {/* Dirección de entrega */}
          <DireccionEntregaSelector
            user={user}
            onChange={setDireccionEntrega}
          />

          {/* Observaciones */}
          <div>
            <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              id="observaciones" name="observaciones" rows="3"
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Cualquier indicación adicional..."
              value={formData.observaciones} onChange={handleChange}
            />
          </div>

          {/* Importe total */}
          {importeTotal > 0 && (
            <div className="bg-gray-50 rounded-lg px-4 py-3">
              <p className="text-sm text-gray-500">Importe total</p>
              <p className="text-2xl font-bold text-gray-900">{importeTotal.toFixed(2)} €</p>
            </div>
          )}
        </div>

        {/* Botones — si hay aviso pendiente de confirmar */}
        {confirmandoLimite ? (
          <div className="mt-8 bg-yellow-50 border border-yellow-300 rounded-xl p-4">
            <p className="text-yellow-800 font-medium mb-4">
              ¿Confirmas que quieres enviar la solicitud aunque se supere el límite de gasto anual?
            </p>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-yellow-600 text-white py-3 rounded-lg font-medium hover:bg-yellow-700 disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : 'Sí, enviar igualmente'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmandoLimite(false)}
                className="px-6 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-primary-600 text-white py-4 rounded-lg text-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Enviando solicitud...' : 'Enviar Solicitud'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/materiales')}
              className="px-8 bg-gray-300 text-gray-700 py-4 rounded-lg text-lg font-medium hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
