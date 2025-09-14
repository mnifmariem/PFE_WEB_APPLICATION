// backend/src/middleware/validation.js
const Joi = require('joi');

const validateDataProcessing = (req, res, next) => {
  const schema = Joi.object({
    data: Joi.alternatives().try(
      Joi.string().required(),
      Joi.array().required()
    ),
    type: Joi.string().valid('string', 'array').default('string')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    const validationError = new Error('Validation failed');
    validationError.name = 'ValidationError';
    validationError.details = error.details;
    return next(validationError);
  }
  next();
};

const validateSerialConnection = (req, res, next) => {
  const schema = Joi.object({
    comPort: Joi.string().required(),
    baudRate: Joi.number().integer().valid(9600, 115200, 57600, 38400, 19200).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    const validationError = new Error('Validation failed');
    validationError.name = 'ValidationError';
    validationError.details = error.details;
    return next(validationError);
  }
  next();
};

module.exports = {
  validateDataProcessing,
  validateSerialConnection
};