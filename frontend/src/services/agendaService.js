import api from './api';

const agendaService = {
  getAll: async () => {
    const response = await api.get('/agenda');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/agenda', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/agenda/${id}`, data);
    return response.data;
  },

  remove: async (id) => {
    const response = await api.delete(`/agenda/${id}`);
    return response.data;
  },
};

export default agendaService;
