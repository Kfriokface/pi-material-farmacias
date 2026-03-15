const { body } = require('express-validator');

const updateConfiguracionValidation = [
  body('limiteUsuarioMensual')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('El límite de usuario debe ser un número positivo'),
  body('limiteFarmaciaMensual')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('El límite de farmacia debe ser un número positivo'),
  body('soporteNombre')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
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
    .isLength({ max: 20 })
    .withMessage('El teléfono de soporte no puede exceder 20 caracteres'),
  body('appNombre')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('El nombre de la app no puede exceder 100 caracteres'),
  body('avisoActivo')
    .optional()
    .isBoolean()
    .withMessage('avisoActivo debe ser true o false')
    .toBoolean(),
  body('avisoTexto')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('El texto del aviso no puede exceder 500 caracteres'),
];

module.exports = { updateConfiguracionValidation };