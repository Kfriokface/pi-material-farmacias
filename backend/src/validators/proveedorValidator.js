const { body, query } = require('express-validator');

const TIPOS_EMAIL_VALIDOS = ['DEFAULT', 'PRESUPUESTOS', 'PRODUCCION', 'FACTURACION'];

const emailsValidation = (required = false) => {
  const rules = [
    body('emails')
      .if((value) => value !== undefined)
      .isArray({ min: 1 }).withMessage('emails debe ser un array con al menos un elemento'),
    body('emails.*.email')
      .if((value, { req }) => req.body.emails !== undefined)
      .notEmpty().withMessage('El email no puede estar vacío').bail()
      .isEmail().withMessage('El formato del email no es válido')
      .trim(),
    body('emails.*.tipo')
      .if((value, { req }) => req.body.emails !== undefined)
      .notEmpty().withMessage('El tipo de email es obligatorio').bail()
      .isIn(TIPOS_EMAIL_VALIDOS).withMessage(`El tipo debe ser uno de: ${TIPOS_EMAIL_VALIDOS.join(', ')}`),
  ];

  if (required) {
    rules.unshift(
      body('emails')
        .notEmpty().withMessage('Es obligatorio indicar al menos un email')
        .isArray({ min: 1 }).withMessage('emails debe ser un array con al menos un elemento')
    );
  }

  return rules;
};

const createProveedorValidation = [
  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio').bail()
    .trim()
    .isLength({ max: 150 }).withMessage('El nombre no puede exceder 150 caracteres'),
  body('nif')
    .notEmpty().withMessage('El NIF es obligatorio').bail()
    .trim()
    .isLength({ max: 20 }).withMessage('El NIF no puede exceder 20 caracteres'),
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
  body('telefono')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 20 }).withMessage('El teléfono no puede exceder 20 caracteres'),
  body('contacto')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 150 }).withMessage('El nombre de contacto no puede exceder 150 caracteres'),
  body('observaciones')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('Las observaciones no pueden exceder 1000 caracteres'),
  ...emailsValidation(true),
];

const updateProveedorValidation = [
  body('nombre')
    .optional()
    .trim()
    .notEmpty().withMessage('El nombre no puede estar vacío').bail()
    .isLength({ max: 150 }).withMessage('El nombre no puede exceder 150 caracteres'),
  body('nif')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 20 }).withMessage('El NIF no puede exceder 20 caracteres'),
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
  body('telefono')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 20 }).withMessage('El teléfono no puede exceder 20 caracteres'),
  body('contacto')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 150 }).withMessage('El nombre de contacto no puede exceder 150 caracteres'),
  body('observaciones')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('Las observaciones no pueden exceder 1000 caracteres'),
  body('activo')
    .optional()
    .isBoolean().withMessage('activo debe ser true o false')
    .toBoolean(),
  ...emailsValidation(false),
];

const listProveedorValidation = [
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
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('search no puede exceder 100 caracteres'),
];

module.exports = {
  createProveedorValidation,
  updateProveedorValidation,
  listProveedorValidation,
};
