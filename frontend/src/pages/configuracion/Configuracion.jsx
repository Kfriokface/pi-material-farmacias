import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import configuracionService from '../../services/configuracionService';
import PhoneInput from '../../components/PhoneInput';
import AddressFields from '../../components/AddressFields';

export default function Configuracion() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    limiteAnualPorFarmacia:       '',
    soporteNombre:                '',
    soporteEmail:                 '',
    soporteTelefono:              '',
    appNombre:                    '',
    avisoActivo:                  false,
    avisoTexto:                   '',
    emailAdmin:                   '',
    entregaDefaultDireccion:      '',
    entregaDefaultCodigoPostal:   '',
    entregaDefaultLocalidad:      '',
    entregaDefaultProvincia:      '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await configuracionService.get();
      const c = res.data;
      setFormData({
        limiteAnualPorFarmacia:       c.limiteAnualPorFarmacia       ?? '',
        soporteNombre:                c.soporteNombre                ?? '',
        soporteEmail:                 c.soporteEmail                 ?? '',
        soporteTelefono:              c.soporteTelefono              ?? '',
        appNombre:                    c.appNombre                    ?? '',
        avisoActivo:                  c.avisoActivo                  ?? false,
        avisoTexto:                   c.avisoTexto                   ?? '',
        emailAdmin:                   c.emailAdmin                   ?? '',
        entregaDefaultDireccion:      c.entregaDefaultDireccion      ?? '',
        entregaDefaultCodigoPostal:   c.entregaDefaultCodigoPostal   ?? '',
        entregaDefaultLocalidad:      c.entregaDefaultLocalidad      ?? '',
        entregaDefaultProvincia:      c.entregaDefaultProvincia      ?? '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      await configuracionService.update({
        limiteAnualPorFarmacia:       formData.limiteAnualPorFarmacia !== '' ? parseFloat(formData.limiteAnualPorFarmacia) : null,
        soporteNombre:                formData.soporteNombre                || null,
        soporteEmail:                 formData.soporteEmail                 || null,
        soporteTelefono:              formData.soporteTelefono              || null,
        appNombre:                    formData.appNombre                    || null,
        avisoActivo:                  formData.avisoActivo,
        avisoTexto:                   formData.avisoTexto                   || null,
        emailAdmin:                   formData.emailAdmin                   || null,
        entregaDefaultDireccion:      formData.entregaDefaultDireccion      || null,
        entregaDefaultCodigoPostal:   formData.entregaDefaultCodigoPostal   || null,
        entregaDefaultLocalidad:      formData.entregaDefaultLocalidad      || null,
        entregaDefaultProvincia:      formData.entregaDefaultProvincia      || null,
      });
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500 mt-1">Parámetros globales del sistema</p>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Identidad */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Identidad de la app</h2>
          <div>
            <label htmlFor="appNombre" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la aplicación
            </label>
            <input
              type="text" id="appNombre" name="appNombre"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.appNombre} onChange={handleChange}
              placeholder="App Material Farmacias"
            />
          </div>
        </div>

        {/* Límites de gasto */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Presupuesto por área</h2>
          <p className="text-sm text-gray-500 mb-1">
            El presupuesto de cada área se calcula multiplicando este valor por el número de farmacias activas que tiene el área.
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Ejemplo: 50 €/farmacia × 4 farmacias = 200 € de presupuesto para el área. Dejar en blanco para no aplicar límite.
          </p>
          <div>
            <label htmlFor="limiteAnualPorFarmacia" className="block text-sm font-medium text-gray-700 mb-2">
              Importe por farmacia (€/año)
            </label>
            <input
              type="number" id="limiteAnualPorFarmacia" name="limiteAnualPorFarmacia"
              min="0" step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.limiteAnualPorFarmacia} onChange={handleChange}
              placeholder="Sin límite"
            />
          </div>
        </div>

        {/* Aviso global */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Aviso global</h2>
          <div className="flex items-center mb-4">
            <input
              type="checkbox" id="avisoActivo" name="avisoActivo"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={formData.avisoActivo} onChange={handleChange}
            />
            <label htmlFor="avisoActivo" className="ml-2 block text-sm text-gray-700">
              Mostrar aviso en la app
            </label>
          </div>
          <div>
            <label htmlFor="avisoTexto" className="block text-sm font-medium text-gray-700 mb-2">
              Texto del aviso
            </label>
            <textarea
              id="avisoTexto" name="avisoTexto" rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.avisoTexto} onChange={handleChange}
              placeholder="Ej: El sistema estará en mantenimiento el próximo viernes."
            />
          </div>
        </div>

        {/* Soporte */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contacto de soporte</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="soporteNombre" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de contacto
              </label>
              <input
                type="text" id="soporteNombre" name="soporteNombre"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.soporteNombre} onChange={handleChange}
                placeholder="Ej: Equipo de soporte"
              />
            </div>
            <div>
              <label htmlFor="soporteEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email de soporte
              </label>
              <input
                type="email" id="soporteEmail" name="soporteEmail"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.soporteEmail} onChange={handleChange}
                placeholder="soporte@empresa.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono de soporte
              </label>
              <PhoneInput
                name="soporteTelefono"
                value={formData.soporteTelefono}
                onChange={handleChange}
                placeholder="Ej: 900 123 456"
              />
            </div>
          </div>
        </div>

        {/* Notificaciones de solicitudes */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Notificaciones de solicitudes</h2>
          <p className="text-sm text-gray-500 mb-4">
            Email que recibirá un aviso cada vez que se genere una solicitud o se marque como completada.
          </p>
          <div>
            <label htmlFor="emailAdmin" className="block text-sm font-medium text-gray-700 mb-2">
              Email de administración
            </label>
            <input
              type="email" id="emailAdmin" name="emailAdmin"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.emailAdmin} onChange={handleChange}
              placeholder="completadas@empresa.com"
            />
          </div>
        </div>


        {/* Dirección de entrega por defecto */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Dirección de entrega por defecto</h2>
          <p className="text-sm text-gray-500 mb-4">
            Dirección a la que se enviará el material cuando un administrador crea una solicitud y elige la entrega por defecto.
          </p>
          <AddressFields
            values={{
              direccion:    formData.entregaDefaultDireccion,
              codigoPostal: formData.entregaDefaultCodigoPostal,
              localidad:    formData.entregaDefaultLocalidad,
              provincia:    formData.entregaDefaultProvincia,
            }}
            onChange={(addr) => setFormData(prev => ({
              ...prev,
              entregaDefaultDireccion:    addr.direccion,
              entregaDefaultCodigoPostal: addr.codigoPostal,
              entregaDefaultLocalidad:    addr.localidad,
              entregaDefaultProvincia:    addr.provincia,
            }))}
          />
        </div>

        <button
          type="submit" disabled={saving}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Guardando...' : 'Guardar configuración'}
        </button>
      </form>
    </div>
  );
}
