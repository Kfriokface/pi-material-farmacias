const { body, param, query } = require('express-validator');
const { EstadoSolicitud, OrientacionMaterial, TallaBata } = require('../constants/enums');

const createSolicitudValidation = [
  body('establecimientoId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('ID de establecimiento no válido')
    .toInt(),

  body('eventoNombre')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .escape()
    .isLength({ max: 200 })
    .withMessage('El nombre del evento no puede exceder 200 caracteres'),

  body('materialId')
    .notEmpty()
    .withMessage('El material es obligatorio')
    .bail()
    .isInt({ min: 1 })
    .withMessage('ID de material no válido')
    .toInt(),

  body('altoCm')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 1000 })
    .withMessage('El alto debe ser un número entero entre 1 y 1000 cm')
    .toInt(),

  body('anchoCm')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 1000 })
    .withMessage('El ancho debe ser un número entero entre 1 y 1000 cm')
    .toInt(),

  body('orientacion')
    .optional({ nullable: true })
    .isIn(Object.values(OrientacionMaterial))
    .withMessage('Orientación no válida'),

  body('lenguaPersonalizacion')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isIn(['ES', 'CA', 'EU', 'GL', 'VA'])
    .withMessage('Idioma de personalización no válido'),

  body('personalizarNombre')
    .optional()
    .isBoolean()
    .withMessage('personalizarNombre debe ser true o false')
    .toBoolean(),

  body('descripcionPersonalizada')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .escape()
    .isLength({ max: 500 })
    .withMessage('La descripción personalizada no puede exceder 500 caracteres'),

  body('talla')
    .optional({ nullable: true })
    .isIn(Object.values(TallaBata))
    .withMessage('Talla no válida'),

  body('personalizacionBata')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .escape()
    .isLength({ max: 500 })
    .withMessage('La personalización de bata no puede exceder 500 caracteres'),

  body('marcasBata')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .escape()
    .isLength({ max: 200 })
    .withMessage('Las marcas de bata no pueden exceder 200 caracteres'),

  body('marcaId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('ID de marca no válido')
    .toInt(),

  body('direccionEntrega')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .escape()
    .isLength({ max: 200 })
    .withMessage('La dirección de entrega no puede exceder 200 caracteres'),

  body('codigoPostalEntrega')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .escape()
    .matches(/^\d{5}$/)
    .withMessage('El código postal debe tener 5 dígitos'),

  body('localidadEntrega')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .escape()
    .isLength({ max: 100 })
    .withMessage('La localidad no puede exceder 100 caracteres'),

  body('provinciaEntrega')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .escape()
    .isLength({ max: 100 })
    .withMessage('La provincia no puede exceder 100 caracteres'),

  body('telefonoEntrega')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(/^[+]?[0-9\s\-().]{7,20}$/)
    .withMessage('El teléfono no es válido'),

  body('observaciones')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .escape()
    .isLength({ max: 1000 })
    .withMessage('Las observaciones no pueden exceder 1000 caracteres'),
];

const cambiarEstadoValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de solicitud no válido')
    .toInt(),

  body('estado')
    .notEmpty()
    .withMessage('El estado es obligatorio')
    .bail()
    .isIn(Object.values(EstadoSolicitud))
    .withMessage('Estado no válido'),

  body('observaciones')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .escape()
    .isLength({ max: 1000 })
    .withMessage('Las observaciones no pueden exceder 1000 caracteres'),

  body('proveedorEnviadoId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('ID de proveedor no válido')
    .toInt(),
];

const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de solicitud no válido')
    .toInt(),
];

const listSolicitudesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage('El límite debe estar entre 1 y 500')
    .toInt(),

  query('estado')
    .optional()
    .isIn(Object.values(EstadoSolicitud))
    .withMessage('Estado no válido'),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('La búsqueda debe tener entre 1 y 100 caracteres'),

  query('anio')
    .optional()
    .isInt({ min: 2020, max: 2100 })
    .withMessage('El año no es válido')
    .toInt(),

  query('establecimientoId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de establecimiento no válido')
    .toInt(),
];

module.exports = {
  createSolicitudValidation,
  cambiarEstadoValidation,
  idValidation,
  listSolicitudesValidation,
};
