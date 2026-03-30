import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import establecimientoService from '../../services/establecimientoService';
import usuarioService from '../../services/usuarioService';
import areaService from '../../services/areaService';
import { TIPOS_ESTABLECIMIENTO, LENGUAS, nombreCompleto } from '../../utils/constants';
import AddressFields from '../../components/AddressFields';

export default function EstablecimientoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    nombre:        '',
    tipo:          'FARMACIA',
    direccion:     '',
    codigoPostal:  '',
    localidad:     '',
    provincia:     '',
    lengua:        'ES',
    codigoInterno: '',
    codigoERP:     '',
    delegadoId:    '',
    activo:        true,
  });
  const [delegados, setDelegados] = useState([]);
  const [gerentes, setGerentes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [areaFiltro, setAreaFiltro] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const [delegadosRes, gerentesRes, areasRes] = await Promise.all([
        usuarioService.getAll({ rol: 'DELEGADO', limit: 100 }),
        usuarioService.getAll({ rol: 'GERENTE', limit: 100 }),
        areaService.getAll({ limit: 100 }),
      ]);
      setDelegados(delegadosRes.data || []);
      setGerentes(gerentesRes.data || []);
      setAreas(areasRes.data || []);

      if (isEditing) {
        const res = await establecimientoService.getById(id);
        const est = res.data;
        setFormData({
          nombre:        est.nombre,
          tipo:          est.tipo || 'FARMACIA',
          direccion:     est.direccion || '',
          codigoPostal:  est.codigoPostal || '',
          localidad:     est.localidad || '',
          provincia:     est.provincia || '',
          lengua:        est.lengua || 'ES',
          codigoInterno: est.codigoInterno || '',
          codigoERP:     est.codigoERP || '',
          delegadoId:    est.delegadoId || '',
          activo:        est.activo,
        });
        if (est.areaId) setAreaFiltro(String(est.areaId));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar datos');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'tipo') {
      setAreaFiltro('');
      setFormData({ ...formData, tipo: value, delegadoId: '' });
    } else {
      setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    }
  };

  const handleAreaChange = (e) => {
    setAreaFiltro(e.target.value);
    setFormData({ ...formData, delegadoId: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        areaId:     areaFiltro ? parseInt(areaFiltro) : null,
        delegadoId: formData.delegadoId ? parseInt(formData.delegadoId) : null,
      };
      if (isEditing) {
        await establecimientoService.update(id, dataToSend);
      } else {
        await establecimientoService.create(dataToSend);
      }
      navigate('/admin/establecimientos');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar establecimiento');
    } finally {
      setLoading(false);
    }
  };

  const esFarmacia = formData.tipo === 'FARMACIA';
  const usuariosDisponibles = esFarmacia
    ? delegados.filter((d) => !areaFiltro || String(d.areaId) === areaFiltro)
    : gerentes.filter((g) => !areaFiltro || String(g.areaId) === areaFiltro);

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Establecimiento' : 'Nuevo Establecimiento'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="md:col-span-2">
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text" id="nombre" name="nombre" required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.nombre} onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo <span className="text-red-500">*</span>
            </label>
            <select
              id="tipo" name="tipo" required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.tipo} onChange={handleChange}
            >
              {TIPOS_ESTABLECIMIENTO.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="lengua" className="block text-sm font-medium text-gray-700 mb-2">
              Lengua
            </label>
            <select
              id="lengua" name="lengua"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.lengua} onChange={handleChange}
            >
              {LENGUAS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
            <AddressFields
              values={{
                direccion:    formData.direccion,
                codigoPostal: formData.codigoPostal,
                localidad:    formData.localidad,
                provincia:    formData.provincia,
              }}
              onChange={(campos) => setFormData({ ...formData, ...campos })}
            />
          </div>

          <div>
            <label htmlFor="codigoInterno" className="block text-sm font-medium text-gray-700 mb-2">
              Código interno
            </label>
            <input
              type="text" id="codigoInterno" name="codigoInterno"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.codigoInterno} onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="codigoERP" className="block text-sm font-medium text-gray-700 mb-2">
              Código ERP
            </label>
            <input
              type="text" id="codigoERP" name="codigoERP"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.codigoERP} onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Área
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={areaFiltro}
              onChange={handleAreaChange}
            >
              <option value="">Selecciona un área</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </div>

          {areaFiltro && (
            <div>
              <label htmlFor="delegadoId" className="block text-sm font-medium text-gray-700 mb-2">
                {esFarmacia ? 'Delegado responsable' : 'Gerente responsable'}
              </label>
              <select
                id="delegadoId" name="delegadoId"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.delegadoId} onChange={handleChange}
              >
                <option value="">{esFarmacia ? 'Sin delegado asignado' : 'Sin gerente asignado'}</option>
                {usuariosDisponibles.map((u) => (
                  <option key={u.id} value={u.id}>{nombreCompleto(u)}</option>
                ))}
              </select>
            </div>
          )}

          <div className="md:col-span-2">
            <div className="flex items-center">
              <input
                type="checkbox" id="activo" name="activo"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={formData.activo} onChange={handleChange}
              />
              <label htmlFor="activo" className="ml-2 block text-sm text-gray-700">
                Establecimiento activo
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            type="submit" disabled={loading}
            className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
          </button>
          <button
            type="button" onClick={() => navigate('/admin/establecimientos')}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
