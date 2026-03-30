import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import usuarioService from '../../services/usuarioService';
import areaService from '../../services/areaService';
import { ROLES } from '../../utils/constants';
import AddressFields from '../../components/AddressFields';
import PhoneInput from '../../components/PhoneInput';

export default function UsuarioForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    nombre:      '',
    apellido1:   '',
    apellido2:   '',
    rol:         'DELEGADO',
    areaId:      '',
    telefono:    '',
    direccion:   '',
    codigoPostal:'',
    localidad:   '',
    provincia:   '',
    activo:      true,
  });
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const areasRes = await areaService.getAll({ limit: 100 });
      setAreas(areasRes.data || []);

      if (isEditing) {
        const res = await usuarioService.getById(id);
        const u = res.data;
        setFormData({
          nombre:       u.nombre || '',
          apellido1:    u.apellido1 || '',
          apellido2:    u.apellido2 || '',
          rol:          u.rol,
          areaId:       u.areaId || '',
          telefono:     u.telefono || '',
          direccion:    u.direccion || '',
          codigoPostal: u.codigoPostal || '',
          localidad:    u.localidad || '',
          provincia:    u.provincia || '',
          activo:       u.activo,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar usuario');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        areaId: formData.areaId ? parseInt(formData.areaId) : null,
      };
      await usuarioService.update(id, dataToSend);
      navigate('/admin/usuarios');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar usuario');
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
          La creación de usuarios se realizará mediante integración con Entra ID (Azure AD).
          Por ahora solo se pueden editar usuarios existentes.
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Editar Usuario</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <div className="space-y-6">

          {/* Nombre desglosado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="apellido1" className="block text-sm font-medium text-gray-700 mb-2">
                Primer apellido
              </label>
              <input
                type="text" id="apellido1" name="apellido1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.apellido1} onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="apellido2" className="block text-sm font-medium text-gray-700 mb-2">
                Segundo apellido
              </label>
              <input
                type="text" id="apellido2" name="apellido2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.apellido2} onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre
            </label>
            <input
              type="text" id="nombre" name="nombre"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.nombre} onChange={handleChange}
            />
          </div>

          {/* Rol */}
          <div>
            <label htmlFor="rol" className="block text-sm font-medium text-gray-700 mb-2">
              Rol <span className="text-red-500">*</span>
            </label>
            <select
              id="rol" name="rol" required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.rol} onChange={handleChange}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Área y Dirección — solo para roles no admin */}
          {formData.rol !== 'ADMIN' && (
            <>
              {/* Área */}
              <div>
                <label htmlFor="areaId" className="block text-sm font-medium text-gray-700 mb-2">
                  Área
                </label>
                <select
                  id="areaId" name="areaId"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.areaId} onChange={handleChange}
                >
                  <option value="">Sin área asignada</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                <PhoneInput
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Teléfono de contacto"
                />
              </div>

              {/* Dirección de entrega */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-4">
                  Dirección de entrega
                  <span className="text-xs text-gray-400 ml-2">(usada por defecto al procesar solicitudes)</span>
                </p>
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
            </>
          )}

          {/* Activo */}
          <div className="flex items-center">
            <input
              type="checkbox" id="activo" name="activo"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={formData.activo} onChange={handleChange}
            />
            <label htmlFor="activo" className="ml-2 block text-sm text-gray-700">
              Usuario activo
            </label>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            type="submit" disabled={loading}
            className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : 'Actualizar'}
          </button>
          <button
            type="button" onClick={() => navigate('/admin/usuarios')}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}