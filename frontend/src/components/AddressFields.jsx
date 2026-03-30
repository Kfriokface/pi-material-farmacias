import { useState, useRef, useEffect } from 'react';

const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

async function buscarSugerencias(query) {
  const q = query.trim();
  if (!q || q.length < 4) return [];

  const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
    },
    body: JSON.stringify({
      input: q,
      includedRegionCodes: ['es'],
      languageCode: 'es',
    }),
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.suggestions || [];
}

async function obtenerDetalle(placeId) {
  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'addressComponents',
    },
  });

  if (!res.ok) return null;
  return res.json();
}

function extraerCampos(addressComponents) {
  const get = (type) => addressComponents.find(c => c.types.includes(type));

  const route       = get('route')?.longText || '';
  const streetNumber = get('street_number')?.longText || '';
  const direccion   = route ? (streetNumber ? `${route}, ${streetNumber}` : route) : '';

  return {
    direccion,
    codigoPostal: get('postal_code')?.longText || '',
    localidad:    get('locality')?.longText || get('sublocality_level_1')?.longText || '',
    provincia:    get('administrative_area_level_2')?.longText || get('administrative_area_level_1')?.longText || '',
  };
}

// values debe tener: { direccion, codigoPostal, localidad, provincia }
// onChange recibe el mismo shape con los campos actualizados
export default function AddressFields({ values, onChange, showProvincia = true }) {
  const [sugerencias, setSugerencias] = useState([]);
  const [abierto, setAbierto]         = useState(false);
  const [buscando, setBuscando]       = useState(false);
  const timerRef   = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDireccionChange = (e) => {
    const val = e.target.value;
    onChange({ ...values, direccion: val });

    clearTimeout(timerRef.current);
    if (val.trim().length >= 4) {
      setBuscando(true);
      timerRef.current = setTimeout(async () => {
        const resultados = await buscarSugerencias(val);
        setSugerencias(resultados);
        setAbierto(resultados.length > 0);
        setBuscando(false);
      }, 400);
    } else {
      setSugerencias([]);
      setAbierto(false);
      setBuscando(false);
    }
  };

  const handleSeleccionar = async (sugerencia) => {
    const placeId = sugerencia.placePrediction?.placeId;

    setSugerencias([]);
    setAbierto(false);

    if (!placeId) return;

    const detalle = await obtenerDetalle(placeId);
    if (!detalle?.addressComponents) return;

    // Usamos la dirección formateada de Google (calle + número)
    // El usuario puede completar manualmente con piso, puerta, etc.
    const campos = extraerCampos(detalle.addressComponents);
    onChange({ ...values, ...campos });
  };

  const handleField = (e) => {
    onChange({ ...values, [e.target.name]: e.target.value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* Dirección con autocomplete */}
      <div className="md:col-span-2 relative" ref={wrapperRef}>
        <p className="text-xs text-gray-400 mb-1">Selecciona una sugerencia para autocompletar. Puedes añadir piso, puerta, etc. a continuación.</p>
        <input
          type="text"
          name="direccion"
          value={values.direccion}
          onChange={handleDireccionChange}
          placeholder="Calle y número"
          autoComplete="off"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {buscando && (
          <span className="absolute right-3 top-3.5 text-xs text-gray-400">Buscando...</span>
        )}
        {abierto && sugerencias.length > 0 && (
          <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
            {sugerencias.map((s, i) => (
              <li
                key={i}
                onMouseDown={() => handleSeleccionar(s)}
                className="px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 cursor-pointer border-b border-gray-100 last:border-0"
              >
                {s.placePrediction?.text?.text || ''}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Localidad */}
      <div>
        <input
          type="text"
          name="localidad"
          value={values.localidad}
          onChange={handleField}
          placeholder="Localidad"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Provincia */}
      {showProvincia && (
        <div>
          <input
            type="text"
            name="provincia"
            value={values.provincia}
            onChange={handleField}
            placeholder="Provincia"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      )}

      {/* Código postal */}
      <div>
        <input
          type="text"
          name="codigoPostal"
          value={values.codigoPostal}
          onChange={handleField}
          placeholder="Código postal"
          maxLength={5}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

    </div>
  );
}
