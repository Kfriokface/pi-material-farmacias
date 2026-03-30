import { useState } from 'react';
import { isValidPhoneNumber } from 'libphonenumber-js';

export default function PhoneInput({ name, value, onChange, placeholder = 'Teléfono de contacto', required = false }) {
  const [touched, setTouched] = useState(false);

  const isValid = !value || isValidPhoneNumber(value, 'ES');
  const showError = touched && value && !isValid;

  return (
    <div>
      <input
        type="tel"
        name={name}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={() => setTouched(true)}
        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          showError ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'
        }`}
      />
      {showError && (
        <p className="text-xs text-red-500 mt-1">Introduce un teléfono español válido (ej: 612 345 678)</p>
      )}
    </div>
  );
}
