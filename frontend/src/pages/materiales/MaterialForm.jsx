import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import materialService from '../../services/materialService';
import marcaService from '../../services/marcaService';
import proveedorService from '../../services/proveedorService';
import { LENGUAS } from '../../utils/constants';

const FILES_URL = import.meta.env.VITE_FILES_URL || 'http://localhost:3000/files';

export default function MaterialForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    nombre: '',
    proveedorId: '',
    descripcion: '',
    precio: '',
    precioPublico: '',
    tipoPrecio: 'UNIDAD',
    permiteAltoAncho: false,
    orientacion: '',
    altoMaxCm: '',
    anchoMaxCm: '',
    permitePersonalizar: false,
    lenguas: [],
    permiteTalla: false,
    permitePersonalizacionBata: false,
    visibleParaDelegado: true,
    tipoEstablecimiento: '',
    activo: true,
    // Marca: al final
    permiteMarca: true,
    marcaId: '',
  });

  const [marcas, setMarcas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadMarcas();
    loadProveedores();
    if (isEditing) loadMaterial();
  }, [id]);

  const loadMarcas = async () => {
    try {
      const response = await marcaService.getAll({ limit: 100 });
      setMarcas(response.data || []);
    } catch (err) {
      console.error('Error al cargar marcas:', err);
    }
  };

  const loadProveedores = async () => {
    try {
      const response = await proveedorService.getAll({ limit: 100 });
      setProveedores(response.data || []);
    } catch (err) {
      console.error('Error al cargar proveedores:', err);
    }
  };

  const loadMaterial = async () => {
    try {
      const response = await materialService.getById(id);
      const mat = response.data;
      setMaterial(mat);
      setFormData({
        nombre: mat.nombre,
        proveedorId: mat.proveedorId || '',
        descripcion: mat.descripcion || '',
        precio: mat.precio || '',
        precioPublico: mat.precioPublico || '',
        tipoPrecio: mat.tipoPrecio || 'UNIDAD',
        permiteAltoAncho: mat.permiteAltoAncho,
        orientacion: mat.orientacion || '',
        altoMaxCm: mat.altoMaxCm || '',
        anchoMaxCm: mat.anchoMaxCm || '',
        permitePersonalizar: mat.permitePersonalizar,
        lenguas: mat.lenguas ? mat.lenguas.split(',') : [],
        permiteTalla: mat.permiteTalla,
        permitePersonalizacionBata: mat.permitePersonalizacionBata,
        visibleParaDelegado: mat.visibleParaDelegado,
        tipoEstablecimiento: mat.tipoEstablecimiento || '',
        activo: mat.activo,
        permiteMarca: mat.permiteMarca,
        marcaId: mat.marcaId || '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar material');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'permiteMarca' && checked) {
      // Al activar selección de marca, limpiar marca fija
      setFormData({ ...formData, permiteMarca: true, marcaId: '' });
    } else if (name === 'permitePersonalizar' && !checked) {
      setFormData({ ...formData, permitePersonalizar: false, lenguas: [] });
    } else if ((name === 'permiteAltoAncho' || name === 'permitePersonalizar') && checked) {
      // Grupo gráfico activo → limpiar grupo textil
      setFormData({ ...formData, [name]: true, permiteTalla: false, permitePersonalizacionBata: false });
    } else if ((name === 'permiteTalla' || name === 'permitePersonalizacionBata') && checked) {
      // Grupo textil activo → limpiar grupo gráfico
      setFormData({ ...formData, [name]: true, permiteAltoAncho: false, orientacion: '', altoMaxCm: '', anchoMaxCm: '', permitePersonalizar: false, lenguas: [] });
    } else if (name === 'permiteAltoAncho' && !checked) {
      // Al desactivar medidas, limpiar orientación y máximos
      setFormData({ ...formData, permiteAltoAncho: false, orientacion: '', altoMaxCm: '', anchoMaxCm: '' });
    } else if (name === 'tipoEstablecimiento' && (value === 'CLINICA' || value === 'EVENTO')) {
      // Clínicas y eventos no son visibles para delegados
      setFormData({ ...formData, tipoEstablecimiento: value, visibleParaDelegado: false });
    } else {
      setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    }
  };

  const handleLenguaToggle = (value) => {
    setFormData(prev => ({
      ...prev,
      lenguas: prev.lenguas.includes(value)
        ? prev.lenguas.filter(l => l !== value)
        : [...prev.lenguas, value],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        marcaId: formData.permiteMarca ? null : (formData.marcaId ? parseInt(formData.marcaId) : null),
        proveedorId: formData.proveedorId ? parseInt(formData.proveedorId) : null,
        precio: formData.precio ? parseFloat(formData.precio) : null,
        precioPublico: formData.precioPublico ? parseFloat(formData.precioPublico) : null,
        tipoEstablecimiento: formData.tipoEstablecimiento,
        orientacion: formData.permiteAltoAncho ? (formData.orientacion || null) : null,
        altoMaxCm: formData.permiteAltoAncho ? (formData.altoMaxCm ? parseInt(formData.altoMaxCm) : null) : null,
        anchoMaxCm: formData.permiteAltoAncho ? (formData.anchoMaxCm ? parseInt(formData.anchoMaxCm) : null) : null,
        lenguas: formData.permitePersonalizar && formData.lenguas.length > 0 ? formData.lenguas.join(',') : null,
      };

      if (isEditing) {
        await materialService.update(id, dataToSend);
        navigate('/admin/materiales');
      } else {
        const response = await materialService.create(dataToSend);
        navigate(`/admin/materiales/${response.data.id}/editar`);
        return;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar material');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      await materialService.uploadImage(id, file);
      loadMaterial();
      alert('Imagen subida correctamente');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al subir imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!window.confirm('¿Eliminar imagen principal?')) return;
    try {
      await materialService.deleteImage(id);
      loadMaterial();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar imagen');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Material' : 'Nuevo Material'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Información básica ─────────────────────────── */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Información básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Nombre */}
            <div className="md:col-span-2">
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text" id="nombre" name="nombre" required
                maxLength={200} minLength={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.nombre} onChange={handleChange}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{formData.nombre.length} / 200</p>
            </div>

            {/* Proveedor */}
            <div>
              <label htmlFor="proveedorId" className="block text-sm font-medium text-gray-700 mb-1">
                Proveedor <span className="text-red-500">*</span>
              </label>
              <select
                id="proveedorId" name="proveedorId" required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.proveedorId} onChange={handleChange}
              >
                <option value="">Selecciona un proveedor</option>
                {proveedores.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>

            {/* Precio visible */}
            <div>
              <label htmlFor="precioPublico" className="block text-sm font-medium text-gray-700 mb-1">
                Precio visible (€)
              </label>
              <input
                type="number" step="0.01" min="0" max="999.99" id="precioPublico" name="precioPublico"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.precioPublico} onChange={handleChange}
              />
              <p className="text-xs text-gray-400 mt-1">Precio fijo que verán delegados y gerentes en el catálogo y en la solicitud.</p>
            </div>

            {/* Precio interno + tipo de precio (agrupados) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio interno — admin (€)
              </label>
              <div className="flex gap-2">
                <input
                  type="number" step="0.01" min="0" max="999.99" id="precio" name="precio"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.precio} onChange={handleChange}
                />
                <select
                  name="tipoPrecio"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  value={formData.tipoPrecio} onChange={handleChange}
                >
                  <option value="UNIDAD">/ unidad</option>
                  <option value="METRO2">/ m²</option>
                </select>
              </div>
              <p className="text-xs text-gray-400 mt-1">Precio de coste real. Solo visible para admin. No se muestra a los usuarios.</p>
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                id="descripcion" name="descripcion" rows="3"
                maxLength={1000}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.descripcion} onChange={handleChange}
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-400">Visible para el usuario en el catálogo y formulario de solicitud.</p>
                <p className="text-xs text-gray-400">{formData.descripcion.length} / 1000</p>
              </div>
            </div>

          </div>
        </div>

        {/* ── Visibilidad y disponibilidad ────────────────── */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Visibilidad y disponibilidad</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Tipo de uso */}
            <div>
              <label htmlFor="tipoEstablecimiento" className="block text-sm font-medium text-gray-700 mb-1">
                Disponible para <span className="text-red-500">*</span>
              </label>
              <select
                id="tipoEstablecimiento" name="tipoEstablecimiento"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.tipoEstablecimiento} onChange={handleChange}
              >
                <option value="">Elegir uno...</option>
                <option value="FARMACIA">Farmacias</option>
                <option value="CLINICA">Clínicas</option>
                <option value="EVENTO">Eventos</option>
              </select>
            </div>

            <div className="space-y-4 pt-1">

              {/* Visible para delegado */}
              {(formData.tipoEstablecimiento === 'CLINICA' || formData.tipoEstablecimiento === 'EVENTO') ? (
                <p className="text-xs text-amber-600 mt-1">
                  No aplicable: los delegados no tienen acceso a este tipo de material.
                </p>
              ) : (
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox" id="visibleParaDelegado" name="visibleParaDelegado"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={formData.visibleParaDelegado} onChange={handleChange}
                    />
                    <label htmlFor="visibleParaDelegado" className="text-sm font-medium text-gray-700">
                      Visible para delegados
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 ml-6">
                    Si está desactivado, solo lo ven gerentes y admin.
                  </p>
                </div>
              )}

              {/* Activo */}
              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox" id="activo" name="activo"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={formData.activo} onChange={handleChange}
                  />
                  <label htmlFor="activo" className="text-sm font-medium text-gray-700">
                    Material activo
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-1 ml-6">Si está desactivado, no aparece en el catálogo ni se puede solicitar.</p>
              </div>

            </div>
          </div>
        </div>

        {/* ── Marca ───────────────────────────────────────── */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Marca</h2>
          <div className="space-y-4">

            <div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox" id="permiteMarca" name="permiteMarca"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={formData.permiteMarca} onChange={handleChange}
                />
                <label htmlFor="permiteMarca" className="text-sm font-medium text-gray-700">
                  Permitir que el usuario elija la marca al solicitar
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-1 ml-6">
                Si está activado, el usuario verá un selector de marca en el formulario de solicitud. Si está desactivado, se asigna una marca fija a todos los pedidos de este material.
              </p>
            </div>

            {!formData.permiteMarca && (
              <div className="ml-6">
                <label htmlFor="marcaId" className="block text-sm font-medium text-gray-700 mb-1">
                  Marca fija del material
                </label>
                <select
                  id="marcaId" name="marcaId"
                  className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.marcaId} onChange={handleChange}
                >
                  <option value="">Sin marca</option>
                  {marcas.map((marca) => (
                    <option key={marca.id} value={marca.id}>{marca.nombre}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Esta marca se asignará automáticamente a todas las solicitudes de este material.</p>
              </div>
            )}

          </div>
        </div>

        {/* ── Características ─────────────────────────────── */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Características del material</h2>
          <div className="space-y-5">

            {/* Grupo gráfico */}
            <div className="border rounded-lg p-4 space-y-4">
              <p className="text-sm font-semibold text-gray-600">Material gráfico</p>

            {/* Permite medidas */}
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox" id="permiteAltoAncho" name="permiteAltoAncho"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={formData.permiteAltoAncho} onChange={handleChange}
                />
                <label htmlFor="permiteAltoAncho" className="text-sm font-medium text-gray-700">
                  Permite especificar medidas (alto × ancho)
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-1 ml-6">El usuario indicará las medidas en cm al solicitar.</p>

              {formData.permiteAltoAncho && (
                <div className="ml-6 mt-3 space-y-4 border-l-2 border-primary-100 pl-4">

                  {/* Orientación fija */}
                  <div>
                    <label htmlFor="orientacion" className="block text-sm font-medium text-gray-700 mb-1">
                      Orientación del material
                    </label>
                    <select
                      id="orientacion" name="orientacion"
                      className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                      value={formData.orientacion} onChange={handleChange}
                    >
                      <option value="">Sin especificar (el usuario la elige)</option>
                      <option value="HORIZONTAL">Horizontal</option>
                      <option value="VERTICAL">Vertical</option>
                      <option value="CUADRADO">Cuadrado</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-1">Si se especifica, el usuario no tendrá que elegirla al solicitar.</p>
                  </div>

                  {/* Medidas máximas */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Medidas máximas permitidas (cm)</p>
                    <div className="flex gap-3 items-center">
                      <div>
                        <label htmlFor="altoMaxCm" className="block text-xs text-gray-500 mb-1">Alto máx.</label>
                        <input
                          type="number" id="altoMaxCm" name="altoMaxCm" min="1" max="1000"
                          className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="ej. 200"
                          value={formData.altoMaxCm} onChange={handleChange}
                        />
                      </div>
                      <span className="text-gray-400 mt-4">×</span>
                      <div>
                        <label htmlFor="anchoMaxCm" className="block text-xs text-gray-500 mb-1">Ancho máx.</label>
                        <input
                          type="number" id="anchoMaxCm" name="anchoMaxCm" min="1" max="1000"
                          className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="ej. 300"
                          value={formData.anchoMaxCm} onChange={handleChange}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Déjalo en blanco si no hay límite de medidas.</p>
                  </div>

                </div>
              )}
            </div>

            {/* Permite personalizar */}
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox" id="permitePersonalizar" name="permitePersonalizar"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={formData.permitePersonalizar} onChange={handleChange}
                />
                <label htmlFor="permitePersonalizar" className="text-sm font-medium text-gray-700">
                  Permite personalización de idioma
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-1 ml-6">El solicitante podrá elegir el idioma en que se fabricará el material.</p>

              {formData.permitePersonalizar && (
                <div className="ml-6 mt-3 border-l-2 border-primary-100 pl-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Idiomas disponibles para este material</p>
                  <div className="flex flex-wrap gap-3">
                    {LENGUAS.map(l => (
                      <label key={l.value} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          checked={formData.lenguas.includes(l.value)}
                          onChange={() => handleLenguaToggle(l.value)}
                        />
                        <span className="text-sm text-gray-700">{l.label}</span>
                      </label>
                    ))}
                  </div>
                  {formData.lenguas.length === 0 && (
                    <p className="text-xs text-amber-600 mt-2">Selecciona al menos un idioma.</p>
                  )}
                </div>
              )}
            </div>

            </div>{/* fin grupo gráfico */}

            <p className="text-xs text-gray-400 text-center">— Activar opciones de un grupo desactiva el otro —</p>

            {/* Grupo textil */}
            <div className="border rounded-lg p-4 space-y-4">
              <p className="text-sm font-semibold text-gray-600">Material textil (prenda)</p>
              <div className="space-y-4">

                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox" id="permiteTalla" name="permiteTalla"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={formData.permiteTalla} onChange={handleChange}
                    />
                    <label htmlFor="permiteTalla" className="text-sm font-medium text-gray-700">
                      Permite seleccionar talla
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 ml-6">Muestra un selector de talla (XS/S/M/L/XL/XXL) al solicitar. Útil para batas, camisetas y prendas en general.</p>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox" id="permitePersonalizacionBata" name="permitePersonalizacionBata"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      checked={formData.permitePersonalizacionBata} onChange={handleChange}
                    />
                    <label htmlFor="permitePersonalizacionBata" className="text-sm font-medium text-gray-700">
                      Permite personalización de prenda
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 ml-6">Muestra un campo de texto libre al solicitar para indicar nombre, iniciales u otros datos de personalización de la prenda.</p>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* ── Imagen principal (solo edición) ─────────────── */}
        {isEditing && material && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Imagen principal</h2>
            {material.imagen ? (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <img
                    src={`${FILES_URL}/${material.imagen}`}
                    alt={material.nombre}
                    className="w-48 h-48 object-cover rounded border"
                  />
                  <img
                    src={`${FILES_URL}/${material.thumbnail}`}
                    alt={`${material.nombre} thumbnail`}
                    className="w-24 h-24 object-cover rounded border"
                  />
                </div>
                <button
                  type="button" onClick={handleDeleteImage}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Eliminar imagen
                </button>
              </div>
            ) : (
              <div>
                <label className="block">
                  <span className="sr-only">Seleccionar imagen</span>
                  <input
                    type="file" accept="image/*"
                    onChange={handleImageUpload} disabled={uploadingImage}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-blue-700 hover:file:bg-primary-100"
                  />
                </label>
                {uploadingImage && <p className="text-sm text-gray-500 mt-2">Subiendo...</p>}
                <p className="text-xs text-gray-500 mt-2">Se generará una imagen de 800×600 y un thumbnail de 400×300.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Botones ─────────────────────────────────────── */}
        <div className="flex gap-4">
          <button
            type="submit" disabled={loading}
            className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
          </button>
          <button
            type="button" onClick={() => navigate('/admin/materiales')}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>

      </form>
    </div>
  );
}
