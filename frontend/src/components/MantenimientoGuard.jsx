import { useState, useEffect } from 'react';
import configuracionService from '../services/configuracionService';

export default function MantenimientoGuard({ children }) {
  const [estado, setEstado] = useState('cargando'); // 'cargando' | 'activo' | 'inactivo'
  const [texto, setTexto] = useState('');

  useEffect(() => {
    configuracionService.get()
      .then(res => {
        const c = res.data ?? res;
        if (c.appNombre) document.title = c.appNombre;
        if (c.avisoActivo) {
          setTexto(c.avisoTexto || '');
          setEstado('activo');
        } else {
          setEstado('inactivo');
        }
      })
      .catch(() => setEstado('inactivo'));
  }, []);

  if (estado === 'cargando') return null;

  if (estado === 'activo') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-100 px-6 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="bg-yellow-100 rounded-full p-4">
              <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-3">Aplicación en mantenimiento</h1>
          {texto && (
            <p className="text-gray-600 text-sm whitespace-pre-line">{texto}</p>
          )}
          <p className="text-xs text-gray-400 mt-6">Inténtalo de nuevo más tarde.</p>
        </div>
      </div>
    );
  }

  return children;
}
