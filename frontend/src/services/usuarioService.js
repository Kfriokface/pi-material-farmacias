import api from './api';

const usuarioService = {
  // Listar usuarios
  getAll: async (params = {}) => {
    const response = await api.get('/usuarios', { params });
    return response.data;
  },

  // Obtener un usuario
  getById: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  // Actualizar usuario
  update: async (id, data) => {
    const response = await api.put(`/usuarios/${id}`, data);
    return response.data;
  },

  // Eliminar usuario
  delete: async (id) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  },
};

export default usuarioService;