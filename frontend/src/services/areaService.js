import api from './api';

const areaService = {
  getAll: async (params = {}) => {
    const response = await api.get('/areas', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/areas/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/areas', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/areas/${id}`, data);
    return response.data;
  },
};

export default areaService;
