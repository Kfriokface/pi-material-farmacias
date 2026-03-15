const { body, param, query } = require('express-validator');
const { Lengua, TipoEstablecimiento } = require('../constants/enums');

const camposComunes = [
  body('nombre')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('El nombre no puede exceder 200 caracteres'),

  body('nif')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage('El NIF no puede exceder 20 caracteres'),

  body('codigoInterno')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('El código interno no puede exceder 50 caracteres'),

  body('codigoERP')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('El código ERP no puede exceder 50 caracteres'),

  body('direccion')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 300 })
    .withMessage('La dirección no puede exceder 300 caracteres'),

  body('codigoPostal')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 10 })
    .withMessage('El código postal no puede exceder 10 caracteres'),

  body('localidad')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('La localidad no puede exceder 100 caracteres'),

  body('provincia')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('La provincia no puede exceder 100 caracteres'),

  body('telefono')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage('El teléfono no puede exceder 20 caracteres'),

  body('lengua')
    .optional()
    .isIn(Object.values(Lengua))
    .withMessage('Lengua no válida'),

  body('sanibrick')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Sanibrick no puede exceder 100 caracteres'),

  body('territoryDescr')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage('TerritoryDescr no puede exceder 200 caracteres'),

  body('panel')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Panel no puede exceder 100 caracteres'),

  body('ubicacion')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('La ubicación no puede exceder 500 caracteres'),

  body('delegadoId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('El delegado no es válido')
    .toInt(),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('activo debe ser true o false')
    .toBoolean(),
];

const createEstablecimientoValidation = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .bail()
    .trim()
    .isLength({ max: 200 })
    .withMessage('El nombre no puede exceder 200 caracteres'),

  body('tipo')
    .optional()
    .isIn(Object.values(TipoEstablecimiento))
    .withMessage('Tipo no válido. Debe ser FARMACIA o CLINICA'),

  ...camposComunes,
];

const updateEstablecimientoValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de establecimiento no válido')
    .toInt(),

  body('tipo')
    .optional()
    .isIn(Object.values(TipoEstablecimiento))
    .withMessage('Tipo no válido. Debe ser FARMACIA o CLINICA'),

  ...camposComunes,
];

const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de establecimiento no válido')
    .toInt(),
];

const listEstablecimientosValidation = [
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

  query('tipo')
    .optional()
    .isIn(Object.values(TipoEstablecimiento))
    .withMessage('Tipo no válido. Debe ser FARMACIA o CLINICA'),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('La búsqueda debe tener entre 1 y 100 caracteres'),
];

module.exports = {
  createEstablecimientoValidation,
  updateEstablecimientoValidation,
  idValidation,
  listEstablecimientosValidation,
};