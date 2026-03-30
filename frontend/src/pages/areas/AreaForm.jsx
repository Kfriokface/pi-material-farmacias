import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import areaService from '../../services/areaService';

export default function AreaForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({ nombre: '' });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) loadArea();
  }, [id]);

  const loadArea = async () => {
    try {
      const res = await areaService.getById(id);
      setFormData({ nombre: res.data.nombre });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar área');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEditing) {
        await areaService.update(id, formData);
      } else {
        await areaService.create(formData);
      }
      navigate('/admin/areas');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar área');
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
          {isEditing ? 'Editar Área' : 'Nueva Área'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text" id="nombre" name="nombre" required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={formData.nombre} onChange={handleChange}
          />
        </div>

        <div className="flex gap-4 pt-2">
          <button
            type="submit" disabled={loading}
            className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
          </button>
          <button
            type="button" onClick={() => navigate('/admin/areas')}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
