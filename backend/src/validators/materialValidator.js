const { body, param, query } = require('express-validator');
const { OrientacionMaterial } = require('../constants/enums');

const createMaterialValidation = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .bail()
    .isLength({ max: 200 })
    .withMessage('El nombre no puede exceder 200 caracteres'),

  body('marcaId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('La marca no es válida')
    .toInt(),

  body('descripcion')
    .optional({ nullable: true })
    .trim(),

  body('precio')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo')
    .toFloat(),

  body('orientacion')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(Object.values(OrientacionMaterial))
    .withMessage('Orientación no válida'),

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

  body('requiereNombreFarmacia')
    .optional()
    .isBoolean()
    .withMessage('requiereNombreFarmacia debe ser true o false')
    .toBoolean(),

  body('metrosCuadrados')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Los metros cuadrados deben ser un número positivo')
    .toFloat(),

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
    .isFloat({ min: 0 })
    .withMessage('El precio público debe ser un número positivo')
    .toFloat(),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('activo debe ser true o false')
    .toBoolean(),
];

const updateMaterialValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de material no válido')
    .toInt(),

  body('nombre')
    .optional()
    .isLength({ max: 200 })
    .withMessage('El nombre no puede exceder 200 caracteres'),

  body('marcaId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('La marca no es válida')
    .toInt(),

  body('descripcion')
    .optional({ nullable: true })
    .trim(),

  body('precio')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo')
    .toFloat(),

  body('orientacion')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(Object.values(OrientacionMaterial))
    .withMessage('Orientación no válida'),

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

  body('requiereNombreFarmacia')
    .optional()
    .isBoolean()
    .withMessage('requiereNombreFarmacia debe ser true o false')
    .toBoolean(),

  body('metrosCuadrados')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Los metros cuadrados deben ser un número positivo')
    .toFloat(),

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
    .isFloat({ min: 0 })
    .withMessage('El precio público debe ser un número positivo')
    .toFloat(),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('activo debe ser true o false')
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
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100')
    .toInt(),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('La búsqueda debe tener entre 1 y 100 caracteres'),
];

module.exports = {
  createMaterialValidation,
  updateMaterialValidation,
  idValidation,
  listMaterialsValidation,
};