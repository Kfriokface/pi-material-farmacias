import api from './api';

const gerenciaService = {
  getAll: async (params = {}) => {
    const response = await api.get('/gerencias', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/gerencias/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/gerencias', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/gerencias/${id}`, data);
    return response.data;
  },
};

export default gerenciaService;
