import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import gerenciaService from '../../services/gerenciaService';
import areaService from '../../services/areaService';
import AddressFields from '../../components/AddressFields';

export default function GerenciaForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    nombre:       '',
    descripcion:  '',
    direccion:    '',
    codigoPostal: '',
    localidad:    '',
    provincia:    '',
    activo:       true,
  });
  const [areaIds, setAreaIds] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      await loadAreas();
      if (isEditing) {
        await loadGerencia();
      }
      setLoadingData(false);
    };
    init();
  }, [id]);

  const loadAreas = async () => {
    try {
      const res = await areaService.getAll({ limit: 200 });
      setAreas(res.data || []);
    } catch {
      // no bloquear el form si falla la carga de áreas
    }
  };

  const loadGerencia = async () => {
    try {
      const res = await gerenciaService.getById(id);
      const g = res.data;
      setFormData({
        nombre:       g.nombre,
        descripcion:  g.descripcion  || '',
        direccion:    g.direccion    || '',
        codigoPostal: g.codigoPostal || '',
        localidad:    g.localidad    || '',
        provincia:    g.provincia    || '',
        activo:       g.activo,
      });
      setAreaIds(g.areas.map(({ area }) => area.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar gerencia');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleAreaToggle = (areaId) => {
    setAreaIds((prev) =>
      prev.includes(areaId) ? prev.filter((a) => a !== areaId) : [...prev, areaId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = { ...formData, areaIds };
      if (isEditing) {
        await gerenciaService.update(id, data);
      } else {
        await gerenciaService.create(data);
      }
      navigate('/admin/gerencias');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar gerencia');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Gerencia' : 'Nueva Gerencia'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Datos básicos */}
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">Datos básicos</h2>

          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text" id="nombre" name="nombre" required maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.nombre} onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="descripcion" name="descripcion" rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.descripcion} onChange={handleChange}
            />
          </div>

          {isEditing && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox" id="activo" name="activo"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={formData.activo} onChange={handleChange}
              />
              <label htmlFor="activo" className="text-sm font-medium text-gray-700">
                Activa
              </label>
            </div>
          )}
        </div>

        {/* Dirección */}
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Dirección de entrega</h2>
            <p className="text-sm text-gray-500 mt-1">
              Dirección por defecto para las solicitudes de las áreas de esta gerencia.
            </p>
          </div>

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

        {/* Áreas */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-1">Áreas</h2>
          <p className="text-sm text-gray-500 mb-4">
            Selecciona las áreas que pertenecen a esta gerencia.
          </p>

          {areas.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No hay áreas disponibles</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {areas.map((area) => (
                <label
                  key={area.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition ${
                    areaIds.includes(area.id)
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={areaIds.includes(area.id)}
                    onChange={() => handleAreaToggle(area.id)}
                  />
                  <span className="text-sm text-gray-800">{area.nombre}</span>
                </label>
              ))}
            </div>
          )}

          {areaIds.length > 0 && (
            <p className="text-xs text-gray-400 mt-3">
              {areaIds.length} área{areaIds.length !== 1 ? 's' : ''} seleccionada{areaIds.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-4">
          <button
            type="submit" disabled={loading}
            className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
          </button>
          <button
            type="button" onClick={() => navigate('/admin/gerencias')}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>

      </form>
    </div>
  );
}
