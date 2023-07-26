import Joi = require('joi');

// Registration validation
export const registerValidator = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email address',
  }),
  first_name: Joi.string()
    .alphanum()
    .min(3)
    .max(15)
    .label('Invalid first name')
    .required()
    .label('First name is required'),
  last_name: Joi.string()
    .alphanum()
    .min(3)
    .max(15)
    .label('Invalid last name')
    .required()
    .label('Last name is required'),
  phone: Joi.string()
    .length(10)
    .pattern(/^[0-9]+$/)
    .required()
    .label('Invalid phone number'),
  // minimum eight characters, one uppercase letter, one lowercase letter, one number and one special character
  password: Joi.string()
    .pattern(
      new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@$!%*?&])[A-Za-zd@$!%*?&]{8,}$'
      )
    )
    .required()
    .label(
      'Minimum 8 characters, 1 uppercase letter, 1 lowercase letter and 1 special character required'
    ),
  confirm_password: Joi.string()
    .required()
    .valid(Joi.ref('password'))
    .label('Passwords do not match'),
});
