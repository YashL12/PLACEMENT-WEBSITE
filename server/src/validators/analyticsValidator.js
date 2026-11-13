const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed for analytics payload',
      errors: errors.array(),
    });
  }
  next();
};

const validateTrackEvent = [
  body('visitorId')
    .trim()
    .notEmpty()
    .withMessage('visitorId is required')
    .isLength({ min: 6, max: 100 })
    .withMessage('visitorId must be between 6 and 100 characters'),
  body('sessionId')
    .trim()
    .notEmpty()
    .withMessage('sessionId is required')
    .isLength({ min: 6, max: 100 })
    .withMessage('sessionId must be between 6 and 100 characters'),
  body('pageUrl')
    .trim()
    .notEmpty()
    .withMessage('pageUrl is required')
    .isLength({ max: 500 })
    .withMessage('pageUrl must not exceed 500 characters'),
  body('pageTitle')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('pageTitle must not exceed 300 characters'),
  body('referrer')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('referrer must not exceed 500 characters'),
  handleValidationErrors,
];

const validateHeartbeat = [
  body('visitorId')
    .trim()
    .notEmpty()
    .withMessage('visitorId is required')
    .isLength({ min: 6, max: 100 }),
  body('sessionId')
    .trim()
    .notEmpty()
    .withMessage('sessionId is required')
    .isLength({ min: 6, max: 100 }),
  body('pageUrl')
    .optional()
    .trim()
    .isLength({ max: 500 }),
  handleValidationErrors,
];

const validateLeavePage = [
  body('visitorId')
    .trim()
    .notEmpty()
    .withMessage('visitorId is required'),
  body('sessionId')
    .trim()
    .notEmpty()
    .withMessage('sessionId is required'),
  body('pageUrl')
    .trim()
    .notEmpty()
    .withMessage('pageUrl is required'),
  body('timeSpent')
    .optional()
    .isNumeric()
    .withMessage('timeSpent must be a number'),
  handleValidationErrors,
];

module.exports = {
  validateTrackEvent,
  validateHeartbeat,
  validateLeavePage,
};

