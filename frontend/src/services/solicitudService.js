import api from './api';

const solicitudService = {
  // Crear solicitud
  create: async (data) => {
    const response = await api.post('/solicitudes', data);
    return response.data;
  },

  // Listar solicitudes
  getAll: async (params = {}) => {
    const response = await api.get('/solicitudes', { params });
    return response.data;
  },

  // Obtener una solicitud
  getById: async (id) => {
    const response = await api.get(`/solicitudes/${id}`);
    return response.data;
  },

  // Consultar presupuesto del área
  getPresupuesto: async (areaId, importe) => {
    const response = await api.get('/solicitudes/presupuesto', {
      params: { areaId: areaId || undefined, importe },
    });
    return response.data;
  },

  // Marcar solicitud como completada (sin foto)
  completar: async (id) => {
    const response = await api.patch(`/solicitudes/${id}/completar`);
    return response.data;
  },

  // Subir foto de instalación (auto-completa la solicitud si estaba en EN_FABRICACION)
  uploadFoto: async (id, file) => {
    const formData = new FormData();
    formData.append('foto', file);
    const response = await api.post(`/solicitudes/${id}/fotos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Subir archivo de personalización
  uploadArchivoPersonalizacion: async (id, file) => {
    const formData = new FormData();
    formData.append('archivo', file);
    const response = await api.post(`/solicitudes/${id}/archivos-personalizacion`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Cambiar estado de una solicitud
  cambiarEstado: async (id, estado, observaciones, proveedorEnviadoId) => {
    const response = await api.patch(`/solicitudes/${id}/estado`, { estado, observaciones, proveedorEnviadoId: proveedorEnviadoId || null });
    return response.data;
  },
};

export default solicitudService;