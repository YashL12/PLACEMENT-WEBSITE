const { body, validationResult } = require('express-validator');

const validateCompany = [
  body('name').trim().notEmpty().withMessage('Company name is required'),
  body('website')
    .optional({ checkFalsy: true })
    .trim()
    .custom((val) => {
      if (!val) return true;
      try {
        const urlToTest = val.startsWith('http://') || val.startsWith('https://') ? val : `https://${val}`;
        new URL(urlToTest);
        return true;
      } catch (e) {
        throw new Error('Website must be a valid URL');
      }
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0]?.msg || 'Validation failed',
        errors: errors.array(),
      });
    }
    next();
  },
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('User ID or Email address is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0]?.msg || 'Validation failed',
        errors: errors.array(),
      });
    }
    next();
  },
];

module.exports = { validateCompany, validateLogin };
