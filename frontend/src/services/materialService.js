import api from './api';

const materialService = {
  // Listar materiales
  getAll: async (params = {}) => {
    const response = await api.get('/materiales', { params });
    return response.data;
  },

  // Obtener un material
  getById: async (id) => {
    const response = await api.get(`/materiales/${id}`);
    return response.data;
  },

  // Crear material
  create: async (data) => {
    const response = await api.post('/materiales', data);
    return response.data;
  },

  // Actualizar material
  update: async (id, data) => {
    const response = await api.put(`/materiales/${id}`, data);
    return response.data;
  },

  // Duplicar material
  duplicate: async (id) => {
    const response = await api.post(`/materiales/${id}/duplicate`);
    return response.data;
  },

  // Eliminar material
  delete: async (id) => {
    const response = await api.delete(`/materiales/${id}`);
    return response.data;
  },

  // Subir imagen principal
  uploadImage: async (id, file) => {
    const formData = new FormData();
    formData.append('imagen', file);
    const response = await api.post(`/materiales/${id}/imagen`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Eliminar imagen principal
  deleteImage: async (id) => {
    const response = await api.delete(`/materiales/${id}/imagen`);
    return response.data;
  },

  // Añadir imagen a galería
  addGalleryImage: async (id, file) => {
    const formData = new FormData();
    formData.append('imagen', file);
    const response = await api.post(`/materiales/${id}/galeria`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Eliminar imagen de galería
  deleteGalleryImage: async (id, filename) => {
    const response = await api.delete(`/materiales/${id}/galeria/${filename}`);
    return response.data;
  },
};

export default materialService;