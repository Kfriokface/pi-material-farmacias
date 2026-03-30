import { useEffect, useState } from 'react';

export default function Lightbox({ src, alt = '', onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-2 hover:bg-black/70 transition-colors"
        onClick={onClose}
        aria-label="Cerrar"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <img
        src={src}
        alt={alt}
        className={`max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-all duration-200 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
