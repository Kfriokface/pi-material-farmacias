import { useEffect, useState } from 'react';

const VISIBLE_MS  = 3000;  // tiempo visible antes de iniciar fade
const FADE_MS     = 500;   // duración del fade-out

export default function SplashScreen({ onDone }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), VISIBLE_MS);
    const doneTimer = setTimeout(() => onDone(), VISIBLE_MS + FADE_MS);
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer); };
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
      style={{ transition: `opacity ${FADE_MS}ms ease-out`, opacity: fading ? 0 : 1 }}
    >
      <div className="splash-content flex flex-col items-center gap-6">
        <img src="/logo.png" alt="Material Farmacias" className="h-40 drop-shadow-sm"/>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900">Material Farmacias</p>
          <p className="mt-1 text-sm text-gray-400">Gestión de material promocional</p>
        </div>
        <div className="flex gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
