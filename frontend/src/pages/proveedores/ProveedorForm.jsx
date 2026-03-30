import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import proveedorService from '../../services/proveedorService';
import AddressFields from '../../components/AddressFields';
import PhoneInput from '../../components/PhoneInput';

const TIPOS_EMAIL = [
  {
    value: 'DEFAULT',
    label: 'Por defecto',
    descripcion: 'Se usará en todos los casos en que no haya un email específico asignado.',
  },
  {
    value: 'PRESUPUESTOS',
    label: 'Presupuestos',
    descripcion: 'Se usará para el envío de solicitudes de presupuesto.',
  },
  {
    value: 'PRODUCCION',
    label: 'Producción',
    descripcion: 'Se usará cuando se envíe un pedido a fabricación.',
  },
  {
    value: 'FACTURACION',
    label: 'Facturación',
    descripcion: 'Se usará para comunicaciones relacionadas con facturas.',
  },
];

const EMAIL_INICIAL = { email: '', tipo: 'DEFAULT' };

export default function ProveedorForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    nombre:        '',
    nif:           '',
    telefono:      '',
    contacto:      '',
    direccion:     '',
    codigoPostal:  '',
    localidad:     '',
    provincia:     '',
    observaciones: '',
    activo:        true,
  });
  const [emails, setEmails] = useState([{ ...EMAIL_INICIAL }]);
  const [loading, setLoading]       = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [error, setError]           = useState('');

  useEffect(() => {
    if (isEditing) loadProveedor();
  }, [id]);

  const loadProveedor = async () => {
    try {
      const res = await proveedorService.getById(id);
      const p = res.data;
      setFormData({
        nombre:        p.nombre,
        nif:           p.nif           || '',
        telefono:      p.telefono      || '',
        contacto:      p.contacto      || '',
        direccion:     p.direccion     || '',
        codigoPostal:  p.codigoPostal  || '',
        localidad:     p.localidad     || '',
        provincia:     p.provincia     || '',
        observaciones: p.observaciones || '',
        activo:        p.activo,
      });
      if (p.emails && p.emails.length > 0) {
        setEmails(p.emails.map(({ email, tipo }) => ({ email, tipo })));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar proveedor');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  // Tipos ya usados (para bloquear duplicados en los selects)
  const tiposUsados = emails.map(e => e.tipo);

  const handleEmailChange = (index, field, value) => {
    setEmails(prev => prev.map((e, i) => i === index ? { ...e, [field]: value } : e));
  };

  const addEmail = () => {
    const tipoLibre = TIPOS_EMAIL.find(t => !tiposUsados.includes(t.value));
    if (tipoLibre) {
      setEmails(prev => [...prev, { email: '', tipo: tipoLibre.value }]);
    }
  };

  const removeEmail = (index) => {
    setEmails(prev => prev.filter((_, i) => i !== index));
  };

  const tiposDisponiblesParaFila = (indexActual) => {
    const tipoActual = emails[indexActual].tipo;
    return TIPOS_EMAIL.filter(
      t => t.value === tipoActual || !tiposUsados.includes(t.value)
    );
  };

  const puedeAnadirEmail = tiposUsados.length < TIPOS_EMAIL.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const hasDefault = emails.some(e => e.tipo === 'DEFAULT');
    if (!hasDefault) {
      setError('Es obligatorio indicar un email por defecto.');
      return;
    }
    const emailsVacios = emails.some(e => !e.email.trim());
    if (emailsVacios) {
      setError('Todos los emails añadidos deben tener una dirección.');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData, emails };
      if (isEditing) {
        await proveedorService.update(id, payload);
      } else {
        await proveedorService.create(payload);
      }
      navigate('/admin/proveedores');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar proveedor');
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
          {isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-5">

        {/* Nombre */}
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">Nombre comercial o razón social del proveedor.</p>
          <input
            type="text" id="nombre" name="nombre" required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={formData.nombre} onChange={handleChange}
          />
        </div>

        {/* NIF */}
        <div>
          <label htmlFor="nif" className="block text-sm font-medium text-gray-700 mb-1">
            NIF {!isEditing && <span className="text-red-500">*</span>}
          </label>
          <p className="text-xs text-gray-500 mb-2">Número de identificación fiscal del proveedor. Debe ser único.</p>
          <input
            type="text" id="nif" name="nif" required={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={formData.nif} onChange={handleChange}
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <p className="text-xs text-gray-500 mb-2">Teléfono principal de contacto del proveedor.</p>
          <PhoneInput
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="Teléfono de contacto"
          />
        </div>

        {/* Persona de contacto */}
        <div>
          <label htmlFor="contacto" className="block text-sm font-medium text-gray-700 mb-1">
            Persona de contacto
          </label>
          <p className="text-xs text-gray-500 mb-2">Nombre de la persona de referencia en el proveedor.</p>
          <input
            type="text" id="contacto" name="contacto"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={formData.contacto} onChange={handleChange}
          />
        </div>

        {/* Dirección */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
          <p className="text-xs text-gray-500 mb-2">Dirección postal del proveedor.</p>
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

        {/* Emails */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correos electrónicos <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-3">
            El email <span className="font-medium">por defecto</span> se usará en todos los casos en que no haya un email específico asignado para la acción.
            Puedes añadir emails adicionales para acciones concretas como presupuestos, producción o facturación.
          </p>

          <div className="space-y-3">
            {emails.map((entry, index) => {
              const tipoInfo = TIPOS_EMAIL.find(t => t.value === entry.tipo);
              const esDefault = entry.tipo === 'DEFAULT';
              const opcionesDisponibles = tiposDisponiblesParaFila(index);

              return (
                <div key={index} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                  <div className="flex gap-3 items-start">
                    <div className="flex-1">
                      <input
                        type="email"
                        placeholder={`Email de ${tipoInfo?.label?.toLowerCase() ?? 'contacto'}`}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                        value={entry.email}
                        onChange={e => handleEmailChange(index, 'email', e.target.value)}
                      />
                    </div>

                    <div className="w-44">
                      {esDefault ? (
                        <div className="px-3 py-2 border border-gray-200 rounded-md bg-white text-sm text-gray-500 text-center">
                          Por defecto
                        </div>
                      ) : (
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
                          value={entry.tipo}
                          onChange={e => handleEmailChange(index, 'tipo', e.target.value)}
                        >
                          {opcionesDisponibles.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    {!esDefault && (
                      <button
                        type="button"
                        onClick={() => removeEmail(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors pt-2"
                        title="Eliminar este email"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {tipoInfo && (
                    <p className="text-xs text-gray-400 mt-1.5 ml-0.5">{tipoInfo.descripcion}</p>
                  )}
                </div>
              );
            })}
          </div>

          {puedeAnadirEmail && (
            <button
              type="button"
              onClick={addEmail}
              className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Añadir otro email
            </button>
          )}
        </div>

        {/* Observaciones */}
        <div>
          <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-1">
            Notas internas
          </label>
          <p className="text-xs text-gray-500 mb-2">Información adicional sobre el proveedor visible solo para administradores.</p>
          <textarea
            id="observaciones" name="observaciones" rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={formData.observaciones} onChange={handleChange}
          />
        </div>

        {/* Activo */}
        {isEditing && (
          <div className="flex items-center">
            <input
              type="checkbox" id="activo" name="activo"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={formData.activo} onChange={handleChange}
            />
            <label htmlFor="activo" className="ml-2 block text-sm text-gray-700">
              Proveedor activo
            </label>
          </div>
        )}

        <div className="flex gap-4 pt-2">
          <button
            type="submit" disabled={loading}
            className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
          </button>
          <button
            type="button" onClick={() => navigate('/admin/proveedores')}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
