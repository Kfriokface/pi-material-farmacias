const { body } = require('express-validator');

const PHONE_REGEX = /^[+]?[0-9\s\-().]{7,20}$/;

const updateConfiguracionValidation = [
  body('limiteAnualPorFarmacia')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('El importe por farmacia debe ser un número positivo'),
  body('soporteNombre')
    .optional({ nullable: true, checkFalsy: true })
    .trim().escape()
    .isLength({ max: 100 })
    .withMessage('El nombre de soporte no puede exceder 100 caracteres'),
  body('soporteEmail')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('El email de soporte no es válido'),
  body('soporteTelefono')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(PHONE_REGEX)
    .withMessage('El teléfono de soporte no es válido'),
  body('appNombre')
    .optional({ nullable: true, checkFalsy: true })
    .trim().escape()
    .isLength({ max: 100 })
    .withMessage('El nombre de la app no puede exceder 100 caracteres'),
  body('avisoActivo')
    .optional()
    .isBoolean()
    .withMessage('avisoActivo debe ser true o false')
    .toBoolean(),
  body('avisoTexto')
    .optional({ nullable: true, checkFalsy: true })
    .trim().escape()
    .isLength({ max: 500 })
    .withMessage('El texto del aviso no puede exceder 500 caracteres'),
  body('emailAdmin')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('El email de administración no es válido'),
  body('entregaDefaultDireccion')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage('La dirección no puede exceder 200 caracteres'),
  body('entregaDefaultCodigoPostal')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(/^\d{5}$/)
    .withMessage('El código postal debe tener 5 dígitos'),
  body('entregaDefaultLocalidad')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('La localidad no puede exceder 100 caracteres'),
  body('entregaDefaultProvincia')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('La provincia no puede exceder 100 caracteres'),
];

module.exports = { updateConfiguracionValidation };
