// Tipos de establecimiento (farmacias y clínicas — no incluye eventos)
export const TIPOS_ESTABLECIMIENTO = [
  { value: 'FARMACIA', label: 'Farmacia' },
  { value: 'CLINICA',  label: 'Clínica'  },
];

export const TIPOS_ESTABLECIMIENTO_FILTRO = [
  { value: '',         label: 'Todos los tipos' },
  { value: 'FARMACIA', label: 'Farmacia'         },
  { value: 'CLINICA',  label: 'Clínica'          },
];

// Tipos de uso de material (incluye eventos — para el formulario de materiales)
export const TIPOS_USO_MATERIAL = [
  { value: 'FARMACIA', label: 'Farmacias' },
  { value: 'CLINICA',  label: 'Clínicas'  },
  { value: 'EVENTO',   label: 'Eventos'   },
];

// Lenguas
export const LENGUAS = [
  { value: 'ES', label: 'Castellano' },
  { value: 'CA', label: 'Catalán'    },
  { value: 'EU', label: 'Euskera'    },
  { value: 'GL', label: 'Gallego'    },
  { value: 'VA', label: 'Valenciano' },
];

// Roles de usuario
export const ROLES = [
  { value: 'ADMIN',    label: 'Administrador' },
  { value: 'GERENTE',  label: 'Gerente'       },
  { value: 'DELEGADO', label: 'Delegado'      },
];

export const ROLES_FILTRO = [
  { value: '',         label: 'Todos los roles' },
  { value: 'ADMIN',    label: 'Admin'           },
  { value: 'GERENTE',  label: 'Gerente'         },
  { value: 'DELEGADO', label: 'Delegado'        },
];

// Tallas de bata
export const TALLAS = [
  { value: 'XS',   label: 'XS'   },
  { value: 'S',    label: 'S'    },
  { value: 'M',    label: 'M'    },
  { value: 'L',    label: 'L'    },
  { value: 'XL',   label: 'XL'   },
  { value: 'XXL',  label: 'XXL'  },
  { value: 'XXXL', label: 'XXXL' },
];

// Orientaciones de material
export const ORIENTACIONES = [
  { value: 'HORIZONTAL', label: 'Horizontal' },
  { value: 'VERTICAL',   label: 'Vertical'   },
  { value: 'CUADRADO',   label: 'Cuadrado'   },
];

// Estados de solicitud
export const ESTADOS_SOLICITUD = [
  { value: 'PENDIENTE',      label: 'Pendiente',       color: 'yellow' },
  { value: 'RECHAZADA',      label: 'Rechazada',       color: 'red'    },
  { value: 'EN_FABRICACION', label: 'En fabricación',  color: 'orange' },
  { value: 'COMPLETADA',     label: 'Completada',      color: 'green'  },
];

export const ESTADOS_SOLICITUD_FILTRO = [
  { value: '', label: 'Todos los estados' },
  ...ESTADOS_SOLICITUD,
];

// Colores para badges de estado de solicitud
export const ESTADO_SOLICITUD_CLASSES = {
  PENDIENTE:      'bg-yellow-100 text-yellow-800',
  RECHAZADA:      'bg-red-100    text-red-800',
  EN_FABRICACION: 'bg-orange-100 text-orange-800',
  COMPLETADA:     'bg-green-100  text-green-800',
};

// Helper: label de un estado de solicitud
export const estadoLabel = (estado) => {
  const found = ESTADOS_SOLICITUD.find((e) => e.value === estado);
  return found ? found.label : estado;
};

// Helper: nombre completo de usuario
export const nombreCompleto = (usuario) => {
  if (!usuario) return '-';
  if (usuario.apellido1) {
    const apellidos = [usuario.apellido1, usuario.apellido2].filter(Boolean).join(' ');
    return `${apellidos}, ${usuario.nombre}`;
  }
  return usuario.nombre || usuario.email || '-';
};