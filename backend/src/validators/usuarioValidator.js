const { body, param, query } = require('express-validator');
const { Rol } = require('../constants/enums');

const updateUsuarioValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID de usuario no válido')
    .toInt(),
  body('nombreCompleto')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 255 }).withMessage('El nombre completo no puede exceder 255 caracteres'),
  body('nombre')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 200 }).withMessage('El nombre no puede exceder 200 caracteres'),
  body('apellido1')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('El primer apellido no puede exceder 100 caracteres'),
  body('apellido2')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('El segundo apellido no puede exceder 100 caracteres'),
  body('rol')
    .optional()
    .isIn(Object.values(Rol)).withMessage('Rol no válido'),
  body('zonaId')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('zonaId no válido')
    .toInt(),
  body('numeroSAP')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 50 }).withMessage('El número SAP no puede exceder 50 caracteres'),
  body('direccion')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 255 }).withMessage('La dirección no puede exceder 255 caracteres'),
  body('codigoPostal')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isPostalCode('ES').withMessage('El código postal no es válido'),
  body('localidad')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('La localidad no puede exceder 100 caracteres'),
  body('provincia')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('La provincia no puede exceder 100 caracteres'),
  body('telefono')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 30 }).withMessage('El teléfono no puede exceder 30 caracteres'),
  body('nif')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 20 }).withMessage('El NIF no puede exceder 20 caracteres'),
  body('destMercancia')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 50 }).withMessage('El destino de mercancía no puede exceder 50 caracteres'),
  body('activo')
    .optional()
    .isBoolean().withMessage('activo debe ser true o false')
    .toBoolean(),
];

const idValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID de usuario no válido')
    .toInt(),
];

const listUsuariosValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La página debe ser un número entero mayor a 0')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100')
    .toInt(),
  query('rol')
    .optional()
    .isIn(Object.values(Rol)).withMessage('Rol no válido'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('La búsqueda debe tener entre 1 y 100 caracteres'),
  query('zonaId')
    .optional()
    .isInt({ min: 1 }).withMessage('zonaId no válido')
    .toInt(),
];

module.exports = {
  updateUsuarioValidation,
  idValidation,
  listUsuariosValidation,
};