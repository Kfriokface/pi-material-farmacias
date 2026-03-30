import api from './api';

const establecimientoService = {
  getAll: async (params = {}) => {
    const response = await api.get('/establecimientos', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/establecimientos/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/establecimientos', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/establecimientos/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/establecimientos/${id}`);
    return response.data;
  },
};

export default establecimientoService;