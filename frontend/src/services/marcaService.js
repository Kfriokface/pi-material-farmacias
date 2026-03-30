import api from './api';

const marcaService = {
  getAll: async (params = {}) => {
    const response = await api.get('/marcas', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/marcas/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/marcas', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/marcas/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/marcas/${id}`);
    return response.data;
  },
};

export default marcaService;