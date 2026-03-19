/**
 * Enums del modelo Prisma
 * Mantener sincronizado con schema.prisma
 */

const Rol = {
  ADMIN:    'ADMIN',
  GERENTE:  'GERENTE',
  DELEGADO: 'DELEGADO',
};

const TipoEstablecimiento = {
  FARMACIA: 'FARMACIA',
  CLINICA:  'CLINICA',
};

const TipoPrecio = {
  UNIDAD: 'UNIDAD',
  METRO2: 'METRO2',
};

const OrientacionMaterial = {
  HORIZONTAL: 'HORIZONTAL',
  VERTICAL:   'VERTICAL',
  CUADRADO:   'CUADRADO',
};

const TallaBata = {
  XS:   'XS',
  S:    'S',
  M:    'M',
  L:    'L',
  XL:   'XL',
  XXL:  'XXL',
  XXXL: 'XXXL',
};

const Lengua = {
  ES: 'ES',
  CA: 'CA',
  EU: 'EU',
  GL: 'GL',
};

const EstadoSolicitud = {
  PENDIENTE:      'PENDIENTE',
  RECHAZADA:      'RECHAZADA',
  EN_FABRICACION: 'EN_FABRICACION',
  ENVIADA:        'ENVIADA',
  COMPLETADA:     'COMPLETADA',
};

module.exports = {
  Rol,
  TipoEstablecimiento,
  TipoPrecio,
  OrientacionMaterial,
  TallaBata,
  Lengua,
  EstadoSolicitud,
};