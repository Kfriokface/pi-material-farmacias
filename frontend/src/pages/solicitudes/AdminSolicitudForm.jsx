import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import materialService from '../../services/materialService';
import establecimientoService from '../../services/establecimientoService';
import areaService from '../../services/areaService';
import solicitudService from '../../services/solicitudService';
import marcaService from '../../services/marcaService';
import usuarioService from '../../services/usuarioService';
import configuracionService from '../../services/configuracionService';
import useAuthStore from '../../store/authStore';
import { TALLAS, LENGUAS } from '../../utils/constants';
import AppMaterialesCatalogo from '../app/AppMaterialesCatalogo';

const FILES_URL = import.meta.env.VITE_FILES_URL || 'http://localhost:3000/files';

export default function AdminSolicitudForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const materialIdParam = searchParams.get('materialId');

  if (!materialIdParam) {
    return (
      <AppMaterialesCatalogo
        onSelect={(id) => navigate(`/admin/solicitudes/nueva?materialId=${id}`)}
      />
    );
  }

  return <AdminSolicitudFormInner materialIdParam={materialIdParam} />;
}

function AdminSolicitudFormInner({ materialIdParam }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [selectedMaterialId] = useState(materialIdParam);

  // Datos del material seleccionado
  const [material, setMaterial] = useState(null);
  const [areas, setAreas] = useState([]);
  const [areaSearch, setAreaSearch] = useState('');
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const establecimientoRef = useRef(null);
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [establecimientos, setEstablecimientos] = useState([]);
  const [loadingEstablecimientos, setLoadingEstablecimientos] = useState(false);
  const [marcas, setMarcas] = useState([]);
  const [gerentes, setGerentes] = useState([]);
  const [imputadoId, setImputadoId] = useState('');
  const [eventoNombre, setEventoNombre] = useState('');

  const [loading, setLoading] = useState(true);
  const [loadingMaterial, setLoadingMaterial] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [presupuesto, setPresupuesto] = useState(null);
  const [presupuestoLoading, setPresupuestoLoading] = useState(false);
  const [confirmandoLimite, setConfirmandoLimite] = useState(false);
  const [opcionEntrega, setOpcionEntrega] = useState('default'); // 'default' | 'usuario'
  const [configEntrega, setConfigEntrega] = useState(null); // dirección por defecto de config

  const [formData, setFormData] = useState({
    establecimientoId:        '',
    altoCm:                   '',
    anchoCm:                  '',
    orientacion:              '',
    lenguaPersonalizacion:    '',
    talla:                    '',
    personalizacionBata:      '',
    marcaId:                  '',
    observaciones:            '',
  });

  // Cargar config al montar
  useEffect(() => {
    configuracionService.get().then(res => {
      const c = res.data;
      if (c.entregaDefaultDireccion) {
        setConfigEntrega({
          direccion:    c.entregaDefaultDireccion,
          codigoPostal: c.entregaDefaultCodigoPostal,
          localidad:    c.entregaDefaultLocalidad,
          provincia:    c.entregaDefaultProvincia,
        });
      }
    }).catch(() => {});
    setLoading(false);
  }, []);

  // Cargar detalle al cambiar material seleccionado
  useEffect(() => {
    if (!selectedMaterialId) {
      setMaterial(null);
      return;
    }
    loadMaterialDetails(selectedMaterialId);
  }, [selectedMaterialId]);

  // Cargar establecimientos al cambiar área seleccionada
  useEffect(() => {
    if (!selectedAreaId || !material || material.tipoEstablecimiento === 'EVENTO') return;
    setLoadingEstablecimientos(true);
    setEstablecimientos([]);
    setFormData(prev => ({ ...prev, establecimientoId: '' }));
    establecimientoService.getAll({ areaId: selectedAreaId, limit: 200 })
      .then(res => setEstablecimientos(res.data || []))
      .catch(() => {})
      .finally(() => setLoadingEstablecimientos(false));
  }, [selectedAreaId]);

  // Autofoco en establecimiento cuando termina de cargar
  useEffect(() => {
    if (!loadingEstablecimientos && selectedAreaId && establecimientoRef.current) {
      establecimientoRef.current.focus();
    }
  }, [loadingEstablecimientos, selectedAreaId]);

  // Consultar presupuesto
  useEffect(() => {
    if (!material) return;
    const esEvento = material.tipoEstablecimiento === 'EVENTO';
    const puedeConsultar = formData.establecimientoId || (esEvento && imputadoId);
    if (puedeConsultar) {
      consultarPresupuesto();
    } else {
      setPresupuesto(null);
    }
  }, [formData.establecimientoId, selectedAreaId, material, imputadoId]);

  const loadMaterialDetails = async (id) => {
    setLoadingMaterial(true);
    setMaterial(null);
    setPresupuesto(null);
    setImputadoId('');
    setEventoNombre('');
    setSelectedAreaId('');
    setAreaSearch('');
    setEstablecimientos([]);
    setFormData({
      establecimientoId: '', altoCm: '', anchoCm: '', orientacion: '',
      personalizarNombre: false, descripcionPersonalizada: '',
      talla: '', personalizacionBata: '', marcaId: '', observaciones: '',
    });
    try {
      const [matRes, areasRes] = await Promise.all([
        materialService.getById(id),
        areaService.getAll({ limit: 100, activo: true }),
      ]);
      const mat = matRes.data;
      setMaterial(mat);
      setAreas(areasRes.data || []);

      if (mat.permiteMarca && !mat.marcaId) {
        const marcasRes = await marcaService.getAll({ limit: 100 });
        setMarcas(marcasRes.data || []);
      }
      if (mat.tipoEstablecimiento === 'EVENTO') {
        const gerentesRes = await usuarioService.getAll({ rol: 'GERENTE', limit: 200, activo: true });
        setGerentes(gerentesRes.data || []);
      }
    } catch {
      setError('Error al cargar el material seleccionado');
    } finally {
      setLoadingMaterial(false);
    }
  };

  const consultarPresupuesto = async () => {
    if (!material) return;
    setPresupuestoLoading(true);
    try {
      const esEvento = material.tipoEstablecimiento === 'EVENTO';
      let areaId = null;
      if (esEvento && imputadoId) {
        const gerente = gerentes.find(g => g.id === parseInt(imputadoId));
        areaId = gerente?.areaId || null;
      } else if (selectedAreaId) {
        areaId = parseInt(selectedAreaId);
      }
      const res = await solicitudService.getPresupuesto(areaId, material.precioPublico || 0);
      setPresupuesto(res.data);
    } catch {
      setPresupuesto(null);
    } finally {
      setPresupuestoLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (presupuesto?.superaDisponibleNeto && !confirmandoLimite) {
      setConfirmandoLimite(true);
      return;
    }

    const dirEntrega = opcionEntrega === 'default' ? configEntrega : direccionUsuario;
    if (!dirEntrega) {
      setError(opcionEntrega === 'default'
        ? 'No hay dirección por defecto configurada. Ve a Configuración para añadirla.'
        : 'No hay dirección disponible para este usuario.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const esEvento = material.tipoEstablecimiento === 'EVENTO';
      const importeTotal = material.precioPublico || 0;

      const solicitudData = {
        materialId: parseInt(selectedMaterialId),
        importeTotal,
        observaciones: formData.observaciones || null,
        ...(material.permiteAltoAncho && {
          altoCm:      formData.altoCm  ? parseInt(formData.altoCm)  : null,
          anchoCm:     formData.anchoCm ? parseInt(formData.anchoCm) : null,
          orientacion: material.orientacion || formData.orientacion || null,
        }),
        ...(material.permitePersonalizar && {
          lenguaPersonalizacion: formData.lenguaPersonalizacion || null,
        }),
        ...(material.permiteTalla && { talla: formData.talla || null }),
        ...(material.permitePersonalizacionBata && { personalizacionBata: formData.personalizacionBata || null }),
        ...(material.permiteMarca && !material.marcaId && {
          marcaId: formData.marcaId ? parseInt(formData.marcaId) : null,
        }),
      };

      if (!esEvento) {
        solicitudData.establecimientoId = parseInt(formData.establecimientoId);
      } else {
        if (eventoNombre) solicitudData.eventoNombre = eventoNombre;
        if (imputadoId) solicitudData.imputadoId = parseInt(imputadoId);
      }

      solicitudData.origenDireccion     = opcionEntrega === 'default' ? 'DEFAULT' : 'USUARIO';
      solicitudData.agendaDireccionId   = null;
      solicitudData.direccionEntrega    = dirEntrega.direccion;
      solicitudData.codigoPostalEntrega = dirEntrega.codigoPostal;
      solicitudData.localidadEntrega    = dirEntrega.localidad;
      solicitudData.provinciaEntrega    = dirEntrega.provincia;

      await solicitudService.create(solicitudData);
      navigate('/admin/solicitudes');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear solicitud');
      setConfirmandoLimite(false);
    } finally {
      setSubmitting(false);
    }
  };

  const esEvento = material?.tipoEstablecimiento === 'EVENTO';
  const hayAvisosPresupuesto = presupuesto?.superaDisponibleNeto;

  // Dirección del usuario según área + establecimiento seleccionados
  const direccionUsuario = (() => {
    if (esEvento && imputadoId) {
      const gerente = gerentes.find(g => g.id === parseInt(imputadoId));
      if (gerente?.direccion && gerente?.codigoPostal && gerente?.localidad && gerente?.provincia) {
        return { nombre: `${gerente.nombre} ${gerente.apellido1}`, direccion: gerente.direccion, codigoPostal: gerente.codigoPostal, localidad: gerente.localidad, provincia: gerente.provincia };
      }
      return null;
    }
    if (formData.establecimientoId) {
      const est = establecimientos.find(e => e.id === parseInt(formData.establecimientoId));
      const delegado = est?.delegado;
      if (delegado?.direccion && delegado?.codigoPostal && delegado?.localidad && delegado?.provincia) {
        return { nombre: `${delegado.nombre} ${delegado.apellido1}`, direccion: delegado.direccion, codigoPostal: delegado.codigoPostal, localidad: delegado.localidad, provincia: delegado.provincia };
      }
      // Fallback: gerente del área
      const area = areas.find(a => a.id === parseInt(selectedAreaId));
      const gerente = area?.usuarios?.[0];
      if (gerente?.direccion && gerente?.codigoPostal && gerente?.localidad && gerente?.provincia) {
        return { nombre: `${gerente.nombre} ${gerente.apellido1}`, direccion: gerente.direccion, codigoPostal: gerente.codigoPostal, localidad: gerente.localidad, provincia: gerente.provincia };
      }
    }
    return null;
  })();

  if (loading) {
    return <div className="flex justify-center items-center h-64"><p className="text-gray-500">Cargando...</p></div>;
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4">
        <button
          onClick={() => navigate('/admin/solicitudes')}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Solicitudes
        </button>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nueva solicitud</h1>
        <p className="text-sm text-gray-500 mt-1">Crear solicitud como Administración</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Info del material seleccionado */}
      {loadingMaterial && <p className="text-sm text-gray-400 mb-6">Cargando material...</p>}
      {material && !loadingMaterial && (
        <div className="bg-white shadow rounded-lg p-4 mb-6 flex gap-4 items-center">
          {material.thumbnail && (
            <img
              src={`${FILES_URL}/${material.thumbnail}`}
              alt={material.nombre}
              className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{material.nombre}</p>
            {material.codigo && <p className="text-xs text-gray-400">{material.codigo}</p>}
            {material.precioPublico > 0 && (
              <p className="text-sm text-gray-600 mt-0.5">{material.precioPublico.toFixed(2)} €</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/solicitudes/nueva')}
            className="text-xs text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            Cambiar
          </button>
        </div>
      )}

      {/* Formulario — solo visible si hay material seleccionado */}
      {material && !loadingMaterial && (
        <>
          {/* Presupuesto */}
          {presupuesto && (
            <div className={`border px-4 py-4 rounded-lg mb-6 ${hayAvisosPresupuesto ? 'bg-yellow-50 border-yellow-300 text-yellow-800' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
              <p className="font-semibold text-sm mb-2">Presupuesto del área</p>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <span className="text-gray-500">Límite total</span>
                <span className="font-medium text-right">{presupuesto.limite?.toFixed(2)} €</span>
                <span className="text-gray-500">Gastado real</span>
                <span className="font-medium text-right">{presupuesto.gastadoReal?.toFixed(2)} €</span>
                <span className="text-gray-500">Disponible neto</span>
                <span className={`font-bold text-right ${presupuesto.disponibleNeto < 0 ? 'text-red-600' : 'text-green-700'}`}>
                  {presupuesto.disponibleNeto?.toFixed(2)} €
                </span>
              </div>
              {hayAvisosPresupuesto && (
                <p className="text-sm font-medium mt-2">Esta solicitud superaría el disponible neto del área.</p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6 space-y-4">

              {/* Establecimiento o evento */}
              {esEvento ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del evento
                    </label>
                    <input
                      type="text"
                      value={eventoNombre}
                      onChange={e => setEventoNombre(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Ej: Congreso Farmacia 2026"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Imputar gasto a <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={imputadoId}
                      onChange={e => setImputadoId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Seleccionar gerente...</option>
                      {gerentes.map(g => (
                        <option key={g.id} value={g.id}>
                          {g.nombre} {g.apellido1} {g.apellido2 || ''} — {g.area?.nombre || 'Sin área'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 items-end">
                  {/* Selector de área con buscador */}
                  <div className="relative flex-1 min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Área <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Buscar área..."
                      value={areaSearch}
                      onChange={e => {
                        setAreaSearch(e.target.value);
                        setSelectedAreaId('');
                        setShowAreaDropdown(true);
                      }}
                      onFocus={() => setShowAreaDropdown(true)}
                      onBlur={() => setTimeout(() => setShowAreaDropdown(false), 150)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {showAreaDropdown && (
                      <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1">
                        {areas
                          .filter(a => !areaSearch.trim() || a.nombre.toLowerCase().includes(areaSearch.toLowerCase()))
                          .map(a => (
                            <button
                              key={a.id}
                              type="button"
                              onMouseDown={() => {
                                setSelectedAreaId(String(a.id));
                                setAreaSearch(a.nombre);
                                setShowAreaDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-primary-50 ${selectedAreaId === String(a.id) ? 'bg-primary-100 text-primary-800' : 'text-gray-700'}`}
                            >
                              {a.nombre}
                            </button>
                          ))
                        }
                      </div>
                    )}
                  </div>

                  {/* Selector de establecimiento — solo visible si hay área */}
                  {selectedAreaId && (
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Establecimiento <span className="text-red-500">*</span>
                      </label>
                      {loadingEstablecimientos ? (
                        <p className="text-sm text-gray-400 py-2">Cargando...</p>
                      ) : (
                        <select
                          ref={establecimientoRef}
                          name="establecimientoId"
                          required
                          value={formData.establecimientoId}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="">Seleccionar establecimiento...</option>
                          {establecimientos.map(est => (
                            <option key={est.id} value={est.id}>
                              {est.nombre} — {est.localidad}
                            </option>
                          ))}
                        </select>
                      )}
                      {presupuestoLoading && <p className="text-xs text-gray-400 mt-1">Consultando presupuesto...</p>}
                    </div>
                  )}
                </div>
              )}

              {/* Alto y ancho */}
              {material.permiteAltoAncho && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alto (cm) <span className="text-red-500">*</span>
                        {material.altoMaxCm && <span className="text-gray-400 font-normal ml-1">(máx. {material.altoMaxCm})</span>}
                      </label>
                      <input
                        type="number" name="altoCm" min="1" max={material.altoMaxCm || undefined} required
                        value={formData.altoCm} onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ancho (cm) <span className="text-red-500">*</span>
                        {material.anchoMaxCm && <span className="text-gray-400 font-normal ml-1">(máx. {material.anchoMaxCm})</span>}
                      </label>
                      <input
                        type="number" name="anchoCm" min="1" max={material.anchoMaxCm || undefined} required
                        value={formData.anchoCm} onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  {!material.orientacion && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Orientación</label>
                      <select name="orientacion" value={formData.orientacion} onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="">Sin especificar</option>
                        <option value="HORIZONTAL">Horizontal</option>
                        <option value="VERTICAL">Vertical</option>
                        <option value="CUADRADO">Cuadrado</option>
                      </select>
                    </div>
                  )}
                </>
              )}

              {/* Marca */}
              {material.permiteMarca && !material.marcaId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                  <select name="marcaId" value={formData.marcaId} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">Sin especificar</option>
                    {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>
              )}

              {/* Talla */}
              {material.permiteTalla && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Talla <span className="text-red-500">*</span>
                  </label>
                  <select name="talla" required value={formData.talla} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">Seleccionar talla...</option>
                    {TALLAS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              )}

              {/* Personalización de idioma */}
              {material.permitePersonalizar && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Idioma del material <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="lenguaPersonalizacion"
                    required
                    value={formData.lenguaPersonalizacion}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
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

              {/* Personalización de bata */}
              {material.permitePersonalizacionBata && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Texto para bordar en la prenda <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text" name="personalizacionBata"
                    required maxLength={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ej: Ldo. Fernando Marín"
                    value={formData.personalizacionBata} onChange={handleChange}
                  />
                  <p className="text-xs text-amber-600 mt-1">Este texto se mandará a fabricar exactamente como lo escribes. Los errores corren a tu cargo.</p>
                </div>
              )}

              {/* Dirección de entrega */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Dirección de entrega</p>
                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${opcionEntrega === 'default' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="opcionEntrega" value="default" checked={opcionEntrega === 'default'} onChange={() => setOpcionEntrega('default')} className="mt-0.5" />
                  <div>
                    <span className="text-sm font-medium text-gray-800">Dirección por defecto</span>
                    {configEntrega ? (
                      <p className="text-sm text-gray-500 mt-0.5">{configEntrega.direccion}, {configEntrega.codigoPostal} {configEntrega.localidad} ({configEntrega.provincia})</p>
                    ) : (
                      <p className="text-xs text-amber-600 mt-0.5">No configurada — ve a Configuración para añadirla.</p>
                    )}
                  </div>
                </label>
                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${opcionEntrega === 'usuario' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="opcionEntrega" value="usuario" checked={opcionEntrega === 'usuario'} onChange={() => setOpcionEntrega('usuario')} className="mt-0.5" />
                  <div>
                    <span className="text-sm font-medium text-gray-800">Entregar al usuario</span>
                    {opcionEntrega === 'usuario' && (
                      direccionUsuario ? (
                        <p className="text-sm text-gray-500 mt-0.5">{direccionUsuario.nombre} — {direccionUsuario.direccion}, {direccionUsuario.codigoPostal} {direccionUsuario.localidad} ({direccionUsuario.provincia})</p>
                      ) : (
                        <p className="text-xs text-amber-600 mt-0.5">{formData.establecimientoId || (esEvento && imputadoId) ? 'El usuario no tiene dirección registrada.' : 'Selecciona primero el establecimiento.'}</p>
                      )
                    )}
                  </div>
                </label>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                <textarea name="observaciones" rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Cualquier indicación adicional..."
                  value={formData.observaciones} onChange={handleChange} />
              </div>

              {/* Importe */}
              {material.precioPublico > 0 && (
                <div className="bg-gray-50 rounded-lg px-4 py-3">
                  <p className="text-sm text-gray-500">Importe total</p>
                  <p className="text-xl font-bold text-gray-900">{material.precioPublico.toFixed(2)} €</p>
                </div>
              )}
            </div>

            {/* Botones */}
            {confirmandoLimite ? (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                <p className="text-yellow-800 font-medium text-sm mb-3">
                  Esta solicitud superaría el disponible neto del área. ¿Confirmas el envío?
                </p>
                <div className="flex gap-3">
                  <button type="submit" disabled={submitting}
                    className="flex-1 bg-yellow-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-yellow-700 disabled:opacity-50">
                    {submitting ? 'Enviando...' : 'Sí, enviar igualmente'}
                  </button>
                  <button type="button" onClick={() => setConfirmandoLimite(false)}
                    className="px-5 bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-300">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-primary-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? 'Enviando...' : 'Crear solicitud'}
                </button>
                <button type="button" onClick={() => navigate('/admin/solicitudes')}
                  className="px-5 bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-300">
                  Cancelar
                </button>
              </div>
            )}
          </form>
        </>
      )}
    </div>
  );
}
