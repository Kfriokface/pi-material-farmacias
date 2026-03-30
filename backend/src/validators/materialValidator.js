const { body, param, query } = require('express-validator');
const { OrientacionMaterial, TipoPrecio, TipoEstablecimiento } = require('../constants/enums');

const createMaterialValidation = [
  body('nombre')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .bail()
    .isLength({ min: 3, max: 200 })
    .withMessage('El nombre debe tener entre 3 y 200 caracteres'),

  body('marcaId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('La marca no es válida')
    .toInt(),

  body('descripcion')
    .optional({ nullable: true })
    .trim()
    .escape()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),

  body('precio')
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 999.99 })
    .withMessage('El precio debe ser un número entre 0 y 999,99')
    .toFloat(),

  body('orientacion')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(Object.values(OrientacionMaterial))
    .withMessage('Orientación no válida'),

  body('altoMaxCm')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 1000 })
    .withMessage('El alto máximo debe ser un entero entre 1 y 1000 cm')
    .toInt(),

  body('anchoMaxCm')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 1000 })
    .withMessage('El ancho máximo debe ser un entero entre 1 y 1000 cm')
    .toInt(),

  body('permiteAltoAncho')
    .optional()
    .isBoolean()
    .withMessage('permiteAltoAncho debe ser true o false')
    .toBoolean(),

  body('permitePersonalizar')
    .optional()
    .isBoolean()
    .withMessage('permitePersonalizar debe ser true o false')
    .toBoolean(),

  body('lenguas')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage('Valor de idiomas no válido'),

  body('requiereNombreFarmacia')
    .optional()
    .isBoolean()
    .withMessage('requiereNombreFarmacia debe ser true o false')
    .toBoolean(),

  body('permiteTalla')
    .optional()
    .isBoolean()
    .withMessage('permiteTalla debe ser true o false')
    .toBoolean(),

  body('permitePersonalizacionBata')
    .optional()
    .isBoolean()
    .withMessage('permitePersonalizacionBata debe ser true o false')
    .toBoolean(),

  body('precioPublico')
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 999.99 })
    .withMessage('El precio público debe ser un número entre 0 y 999,99')
    .toFloat(),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('activo debe ser true o false')
    .toBoolean(),

  body('tipoPrecio')
    .optional()
    .isIn(Object.values(TipoPrecio))
    .withMessage('Tipo de precio no válido'),

  body('tipoEstablecimiento')
    .notEmpty()
    .withMessage('El tipo de uso es obligatorio')
    .isIn(Object.values(TipoEstablecimiento))
    .withMessage('Tipo de uso no válido'),

  body('proveedorId')
    .isInt({ min: 1 })
    .withMessage('El proveedor es obligatorio')
    .toInt(),

  body('visibleParaDelegado')
    .optional()
    .isBoolean()
    .withMessage('visibleParaDelegado debe ser true o false')
    .toBoolean(),

  body('permiteMarca')
    .optional()
    .isBoolean()
    .withMessage('permiteMarca debe ser true o false')
    .toBoolean(),
];

const updateMaterialValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de material no válido')
    .toInt(),

  body('nombre')
    .optional()
    .trim()
    .escape()
    .isLength({ min: 3, max: 200 })
    .withMessage('El nombre debe tener entre 3 y 200 caracteres'),

  body('marcaId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('La marca no es válida')
    .toInt(),

  body('descripcion')
    .optional({ nullable: true })
    .trim()
    .escape()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),

  body('precio')
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 999.99 })
    .withMessage('El precio debe ser un número entre 0 y 999,99')
    .toFloat(),

  body('orientacion')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(Object.values(OrientacionMaterial))
    .withMessage('Orientación no válida'),

  body('altoMaxCm')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 1000 })
    .withMessage('El alto máximo debe ser un entero entre 1 y 1000 cm')
    .toInt(),

  body('anchoMaxCm')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 1000 })
    .withMessage('El ancho máximo debe ser un entero entre 1 y 1000 cm')
    .toInt(),

  body('permiteAltoAncho')
    .optional()
    .isBoolean()
    .withMessage('permiteAltoAncho debe ser true o false')
    .toBoolean(),

  body('permitePersonalizar')
    .optional()
    .isBoolean()
    .withMessage('permitePersonalizar debe ser true o false')
    .toBoolean(),

  body('lenguas')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage('Valor de idiomas no válido'),

  body('requiereNombreFarmacia')
    .optional()
    .isBoolean()
    .withMessage('requiereNombreFarmacia debe ser true o false')
    .toBoolean(),

  body('permiteTalla')
    .optional()
    .isBoolean()
    .withMessage('permiteTalla debe ser true o false')
    .toBoolean(),

  body('permitePersonalizacionBata')
    .optional()
    .isBoolean()
    .withMessage('permitePersonalizacionBata debe ser true o false')
    .toBoolean(),

  body('precioPublico')
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 999.99 })
    .withMessage('El precio público debe ser un número entre 0 y 999,99')
    .toFloat(),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('activo debe ser true o false')
    .toBoolean(),

  body('tipoPrecio')
    .optional()
    .isIn(Object.values(TipoPrecio))
    .withMessage('Tipo de precio no válido'),

  body('tipoEstablecimiento')
    .optional()
    .isIn(Object.values(TipoEstablecimiento))
    .withMessage('Tipo de uso no válido'),

  body('proveedorId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('El proveedor no es válido')
    .toInt(),

  body('visibleParaDelegado')
    .optional()
    .isBoolean()
    .withMessage('visibleParaDelegado debe ser true o false')
    .toBoolean(),

  body('permiteMarca')
    .optional()
    .isBoolean()
    .withMessage('permiteMarca debe ser true o false')
    .toBoolean(),
];

const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de material no válido')
    .toInt(),
];

const listMaterialsValidation = [
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

  query('search')
    .optional()
    .trim()
    .escape()
    .isLength({ min: 1, max: 100 })
    .withMessage('La búsqueda debe tener entre 1 y 100 caracteres'),
];

module.exports = {
  createMaterialValidation,
  updateMaterialValidation,
  idValidation,
  listMaterialsValidation,
};
