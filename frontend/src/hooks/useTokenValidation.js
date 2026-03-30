import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

export default function useTokenValidation() {
  const { logout, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('token');  // leer DENTRO del effect
    console.log('useTokenValidation:', { isAuthenticated, token: !!token });

    if (isAuthenticated && !token) {
      console.log('No hay token en localStorage, cerrando sesión...');
      logout();
      return;
    }

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirado = payload.exp * 1000 < Date.now();
        if (expirado) {
          console.log('Token expirado, cerrando sesión...');
          logout();
        }
      } catch (err) {
        console.error('Token corrupto:', err);
        logout();
      }
    }
  }, [isAuthenticated, logout]);  // ← token ya no es dependencia
}