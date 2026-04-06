const { check, validationResult } = require('express-validator');

const validateRegister = [
  check('name', 'Name must be between 20 and 60 characters').isLength({ min: 20, max: 60 }),
  check('email', 'Please include a valid email').isEmail(),
  check('address', 'Address must not exceed 400 characters').isLength({ max: 400 }),
  check('password', 'Password must be 8-16 characters and include at least one uppercase letter and one special character')
    .isLength({ min: 8, max: 16 })
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateLogin = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateUpdatePassword = [
  check('newPassword', 'Password must be 8-16 characters and include at least one uppercase letter and one special character')
    .isLength({ min: 8, max: 16 })
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateRegister, validateLogin, validateUpdatePassword };
