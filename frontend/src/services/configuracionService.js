import api from './api';

const configuracionService = {
  get: async () => {
    const response = await api.get('/configuracion');
    return response.data;
  },

  update: async (data) => {
    const response = await api.put('/configuracion', data);
    return response.data;
  },
};

export default configuracionService;