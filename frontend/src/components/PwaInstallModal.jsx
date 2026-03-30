import { useState, useEffect } from 'react';
import usePwaInstall from '../hooks/usePwaInstall';

function IOSInstructions({ onDismiss }) {
  return (
    <>
      <p className="text-sm text-gray-600 mb-6">
        Instala la app en tu iPad para acceder más rápido, sin navegador y siempre a mano.
      </p>

      <ol className="space-y-4 mb-8">
        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-bold flex items-center justify-center">1</span>
          <div className="flex items-center gap-2 text-sm text-gray-700 pt-0.5">
            <span>Toca el botón</span>
            {/* iOS Share icon */}
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gray-100">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M13,5.03v8.74c0,.23-.18.41-.41.41h-1.18c-.23,0-.41-.18-.41-.41V5.03l-1.26,1.26c-.16.16-.42.16-.58,0l-.86-.83c-.17-.16-.17-.42,0-.59l3.41-3.41c.16-.16.42-.16.58,0l3.41,3.41c.16.16.16.43,0,.59l-.86.83c-.16.16-.42.15-.58,0l-1.26-1.26ZM9.1,9.54h-2.18c-.23,0-.41.18-.41.41v10.28c0,.23.18.41.41.41h10.15c.23,0,.41-.18.41-.41v-10.28c0-.23-.18-.41-.41-.41h-2.18c-.23,0-.41-.18-.41-.41v-1.18c0-.23.18-.41.41-.41h2.59c.55,0,1.02.2,1.41.59.39.39.59.86.59,1.41v11.11c0,.55-.2,1.02-.59,1.41-.39.39-.86.59-1.41.59H6.51c-.55,0-1.02-.2-1.41-.59-.39-.39-.59-.86-.59-1.41v-11.11c0-.55.2-1.02.59-1.41s.86-.59,1.41-.59h2.59c.23,0,.41.18.41.41v1.18c0,.23-.18.41-.41.41Z"></path>
              </svg>
            </span>
            <span>de compartir en Safari</span>
          </div>
        </li>

        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-bold flex items-center justify-center">2</span>
          <div className="flex items-center gap-2 text-sm text-gray-700 pt-0.5">
            <span>Selecciona</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 font-medium text-xs">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Agregar a pantalla de inicio
            </span>
          </div>
        </li>

        <li className="flex items-start gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-bold flex items-center justify-center">3</span>
          <p className="text-sm text-gray-700 pt-0.5">Toca <strong>Agregar</strong> para confirmar</p>
        </li>
      </ol>

      <button
        onClick={onDismiss}
        className="w-full rounded-xl px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition"
      >
        Ahora no
      </button>
    </>
  );
}

function AndroidInstructions({ onInstall, onDismiss }) {
  return (
    <>
      <p className="text-sm text-gray-600 mb-6">
        Instala la app para acceder más rápido, sin navegador y siempre a mano en tu pantalla de inicio.
      </p>

      <div className="flex flex-col gap-2">
        <button
          onClick={onInstall}
          className="w-full rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700 transition"
        >
          Instalar app
        </button>
        <button
          onClick={onDismiss}
          className="w-full rounded-xl px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition"
        >
          Ahora no
        </button>
      </div>
    </>
  );
}

export default function PwaInstallModal() {
  const { canInstall, isIOS, install, dismiss } = usePwaInstall();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!canInstall) return;
    const timer = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(timer);
  }, [canInstall]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/40" onClick={dismiss} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-5">
          <img src="/logo.png" alt="Logo" className="h-14 w-14 rounded-2xl object-contain shadow-sm" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Material Farmacias</h2>
            <p className="text-sm text-gray-500">Instala la aplicación</p>
          </div>
        </div>

        {isIOS
          ? <IOSInstructions onDismiss={dismiss} />
          : <AndroidInstructions onInstall={install} onDismiss={dismiss} />
        }
      </div>
    </div>
  );
}
