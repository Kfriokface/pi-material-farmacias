import api from './api';

const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Registro (temporal - desarrollo)
  register: async (email, password, nombre, rol) => {
    const response = await api.post('/auth/register', { email, password, nombre, rol });
    return response.data;
  },

  // Obtener usuario actual
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Actualizar perfil
  updateProfile: async (data) => {
    const response = await api.patch('/auth/profile', data);
    return response.data;
  },

  // Subir avatar
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.patch('/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default authService;