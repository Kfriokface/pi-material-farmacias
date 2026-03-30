import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import materialService from '../../services/materialService';
import useAuthStore from '../../store/authStore';
import Lightbox from '../../components/Lightbox';

const FILES_URL = import.meta.env.VITE_FILES_URL || 'http://localhost:3000/files';

export default function AppMaterialesCatalogo({ onSelect } = {}) {
  const navigate = useNavigate();

  const { user } = useAuthStore();
  const [tipoFilter, setTipoFilter] = useState('');
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [marcaFilter, setMarcaFilter] = useState('');
  const [marcas, setMarcas] = useState([]);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const materialesFiltrados = materiales.filter((m) => {
    if (tipoFilter) return m.tipoEstablecimiento === tipoFilter;
    return true;
  });

  useEffect(() => {
    loadMateriales();
  }, [marcaFilter]);

  const loadMateriales = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { limit: 100 };
      if (marcaFilter) {
        params.marcaId = marcaFilter;
      }
      const response = await materialService.getAll(params);
      setMateriales(response.data);
      
      // Extraer marcas únicas para el filtro
      const uniqueMarcas = [...new Map(
        response.data
          .filter(m => m.marca)
          .map(m => [m.marca.id, m.marca])
      ).values()];
      setMarcas(uniqueMarcas);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar materiales');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMaterial = (materialId) => {
    if (onSelect) {
      onSelect(materialId);
    } else {
      navigate(`/app/solicitud/nueva?materialId=${materialId}`);
    }
  };

  if (loading && materiales.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Cargando catálogo...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Catálogo de Materiales</h1>
        <p className="text-gray-600">Selecciona un material para crear una nueva solicitud</p>
      </div>

      {/* Filtros */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-6">
        {user?.rol === 'GERENTE' && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Ubicación:</span>
            {['FARMACIA', 'CLINICA', 'EVENTO'].map((tipo) => (
              <button
                key={tipo}
                onClick={() => setTipoFilter(tipoFilter === tipo ? '' : tipo)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  tipoFilter === tipo
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'
                }`}
              >
                {tipo === 'FARMACIA' ? 'Farmacia' : tipo === 'CLINICA' ? 'Clínica' : 'Evento'}
              </button>
            ))}
          </div>
        )}

        {marcas.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Marcas:</span>
            <select
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={marcaFilter}
              onChange={(e) => setMarcaFilter(e.target.value)}
            >
              <option value="">Ver todas</option>
              {marcas.map((marca) => (
                <option key={marca.id} value={marca.id}>
                  {marca.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Grid de materiales */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {materialesFiltrados.map((material) => (
          <div
            key={material.id}
            onClick={() => handleSelectMaterial(material.id)}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden text-left border-2 border-transparent hover:border-primary-500 flex flex-col cursor-pointer"
          >
            {/* Imagen */}
            <div className="bg-white relative">
              {material.imagen ? (
                <>
                  <img
                    src={`${FILES_URL}/${material.imagen}`}
                    alt={material.nombre}
                    className="w-full h-auto"
                  />
                  {material.imagenZoom && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setLightboxSrc(`${FILES_URL}/${material.imagenZoom}`); }}
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow"
                      aria-label="Ampliar imagen"
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0zm-6-3v6m-3-3h6" />
                      </svg>
                    </button>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center" style={{ aspectRatio: '4/3' }}>
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Contenido */}
            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {material.nombre}
              </h3>
              
              <p className="text-sm text-gray-500 mb-2">{material.codigo}</p>

              {material.marca && (
                <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded mb-2">
                  {material.marca.nombre}
                </span>
              )}

              {material.descripcion && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {material.descripcion}
                </p>
              )}

              {material.precioPublico && (
                <p className="text-xl font-bold text-gray-900">
                  {material.precioPublico.toFixed(2)} €
                </p>
              )}

              {/* Características */}
              <div className="mt-3 flex flex-wrap gap-1">
                {material.permitePersonalizar && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Personalizable
                  </span>
                )}
                {material.permiteTalla && (
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    Tallas
                  </span>
                )}
              </div>

              {/* Botón */}
              <div className="mt-4 text-center">
                <span className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg text-sm font-medium">
                  Solicitar →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}

      {materialesFiltrados.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-lg">No se encontraron materiales</p>
        </div>
      )}
    </div>
  );
}