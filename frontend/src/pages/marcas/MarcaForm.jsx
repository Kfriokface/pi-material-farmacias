import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import marcaService from '../../services/marcaService';

export default function MarcaForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    nombre: '',
    activo: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      loadMarca();
    }
  }, [id]);

  const loadMarca = async () => {
    try {
      const response = await marcaService.getById(id);
      setFormData({
        nombre: response.data.nombre,
        activo: response.data.activo,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar marca');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditing) {
        await marcaService.update(id, formData);
      } else {
        await marcaService.create(formData);
      }
      navigate('/admin/marcas');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar marca');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Marca' : 'Nueva Marca'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <div className="space-y-6">
          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.nombre}
              onChange={handleChange}
            />
          </div>

          {/* Activo */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="activo"
              name="activo"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={formData.activo}
              onChange={handleChange}
            />
            <label htmlFor="activo" className="ml-2 block text-sm text-gray-700">
              Marca activa
            </label>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/marcas')}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}