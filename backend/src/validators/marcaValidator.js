const { body, query } = require('express-validator');

const createMarcaValidation = [
  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio').bail()
    .trim().escape()
    .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
  body('activo')
    .optional()
    .isBoolean().withMessage('activo debe ser true o false')
    .toBoolean(),
];

const updateMarcaValidation = [
  body('nombre')
    .optional()
    .trim().escape()
    .notEmpty().withMessage('El nombre no puede estar vacío').bail()
    .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
  body('activo')
    .optional()
    .isBoolean().withMessage('activo debe ser true o false')
    .toBoolean(),
];

const listMarcaValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page debe ser un número entero positivo')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit debe estar entre 1 y 100')
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
  createMarcaValidation,
  updateMarcaValidation,
  listMarcaValidation,
};
