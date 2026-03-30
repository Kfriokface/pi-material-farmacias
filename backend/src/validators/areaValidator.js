const { body, query } = require('express-validator');

const createAreaValidation = [
  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio').bail()
    .trim().escape()
    .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
  body('descripcion')
    .optional({ nullable: true, checkFalsy: true })
    .trim().escape()
    .isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres'),
  body('direccion')
    .optional({ nullable: true, checkFalsy: true })
    .trim().escape()
    .isLength({ max: 255 }).withMessage('La dirección no puede exceder 255 caracteres'),
  body('codigoPostal')
    .optional({ nullable: true, checkFalsy: true })
    .trim().escape()
    .isPostalCode('ES').withMessage('El código postal no es válido'),
  body('localidad')
    .optional({ nullable: true, checkFalsy: true })
    .trim().escape()
    .isLength({ max: 100 }).withMessage('La localidad no puede exceder 100 caracteres'),
  body('activo')
    .optional()
    .isBoolean().withMessage('activo debe ser true o false')
    .toBoolean(),
];

const updateAreaValidation = [
  body('nombre')
    .optional()
    .trim().escape()
    .notEmpty().withMessage('El nombre no puede estar vacío').bail()
    .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
  body('descripcion')
    .optional({ nullable: true, checkFalsy: true })
    .trim().escape()
    .isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres'),
  body('direccion')
    .optional({ nullable: true, checkFalsy: true })
    .trim().escape()
    .isLength({ max: 255 }).withMessage('La dirección no puede exceder 255 caracteres'),
  body('codigoPostal')
    .optional({ nullable: true, checkFalsy: true })
    .trim().escape()
    .isPostalCode('ES').withMessage('El código postal no es válido'),
  body('localidad')
    .optional({ nullable: true, checkFalsy: true })
    .trim().escape()
    .isLength({ max: 100 }).withMessage('La localidad no puede exceder 100 caracteres'),
  body('activo')
    .optional()
    .isBoolean().withMessage('activo debe ser true o false')
    .toBoolean(),
];

const listAreaValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page debe ser un número entero positivo')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 500 }).withMessage('limit debe estar entre 1 y 500')
    .toInt(),
  query('search')
    .optional()
    .trim().escape()
    .isLength({ min: 1, max: 100 }).withMessage('search no puede exceder 100 caracteres'),
  query('activo')
    .optional()
    .isBoolean().withMessage('activo debe ser true o false')
    .toBoolean(),
];

module.exports = {
  createAreaValidation,
  updateAreaValidation,
  listAreaValidation,
};
