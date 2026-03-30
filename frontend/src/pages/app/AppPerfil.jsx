import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import authService from '../../services/authService';
import { nombreCompleto } from '../../utils/constants';
import AddressFields from '../../components/AddressFields';
import PhoneInput from '../../components/PhoneInput';

const FILES_URL = import.meta.env.VITE_FILES_URL || 'http://localhost:3000/files';

export default function AppPerfil() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();

  const [formData, setFormData] = useState({
    nombre:       user?.nombre || '',
    apellido1:    user?.apellido1 || '',
    apellido2:    user?.apellido2 || '',
    telefono:     user?.telefono || '',
    direccion:    user?.direccion || '',
    codigoPostal: user?.codigoPostal || '',
    localidad:    user?.localidad || '',
    provincia:    user?.provincia || '',
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    setMessage('');
    try {
      const response = await authService.uploadAvatar(file);
      updateUser({ avatar: response.data.avatar });
      setMessage('Avatar actualizado correctamente');
      e.target.value = '';
    } catch (err) {
      setError(err.response?.data?.message || 'Error al subir avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const response = await authService.updateProfile(formData);
      updateUser(response.user);
      navigate('/app/materiales');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const ROL_LABEL = {
    ADMIN:    'Administrador',
    GERENTE:  'Gerente',
    DELEGADO: 'Delegado',
  };

  return (
    <div className="max-w-2xl mx-auto mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
        <p className="text-gray-600">Gestiona tu información personal</p>
      </div>

      {/* Avatar */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Foto de perfil</h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            {user?.avatar ? (
              <img
                src={`${FILES_URL}/${user.avatar}`}
                alt={nombreCompleto(user)}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1">
            <label className="block">
              <span className="sr-only">Cambiar avatar</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 disabled:opacity-50"
              />
            </label>
            {uploading && <p className="text-sm text-gray-500 mt-2">Subiendo...</p>}
            <p className="text-xs text-gray-500 mt-2">
              JPG, PNG o WEBP. Máximo 2MB. Se procesará a 400x400px.
            </p>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Información personal</h2>

        <div className="space-y-4">
          {/* Email (solo lectura) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email" disabled value={user?.email || ''}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
          </div>

          {/* Apellidos + Nombre */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="apellido1" className="block text-sm font-medium text-gray-700 mb-2">
                Primer apellido
              </label>
              <input
                type="text" id="apellido1" name="apellido1"
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.apellido1} onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="apellido2" className="block text-sm font-medium text-gray-700 mb-2">
                Segundo apellido
              </label>
              <input
                type="text" id="apellido2" name="apellido2"
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.nombre} onChange={handleChange}
            />
          </div>

          {/* Rol y zona (solo lectura) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
              <input
                type="text" disabled
                value={ROL_LABEL[user?.rol] || user?.rol || ''}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Área</label>
              <input
                type="text" disabled
                value={user?.area?.nombre || '-'}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
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
            <p className="text-sm font-medium text-gray-700 mb-3">
              Dirección de entrega
              <span className="text-xs text-gray-400 ml-2">(usada por defecto al procesar tus solicitudes)</span>
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
        </div>

        <button
          type="submit" disabled={saving}
          className="w-full mt-6 bg-primary-600 text-white py-3 rounded-lg text-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      {/* Cerrar sesión */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Sesión</h2>
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white py-3 rounded-lg text-lg font-medium hover:bg-red-700"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}