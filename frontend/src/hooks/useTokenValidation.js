import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

export default function useTokenValidation() {
  const { logout, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('token');  // leer DENTRO del effect
    if (isAuthenticated && !token) {
      logout();
      return;
    }

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirado = payload.exp * 1000 < Date.now();
        if (expirado) {
          logout();
        }
      } catch (err) {
        console.error('Token corrupto:', err);
        logout();
      }
    }
  }, [isAuthenticated, logout]);  // ← token ya no es dependencia
}