const express = require('express');
const router = express.Router();
const {
  login,
  getMe,
  getDashboardStats,
  getReviewQueue,
  resolveReview,
  getImportReports,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateLogin } = require('../validators/companyValidator');

// Auth routes
router.post('/login', authLimiter, validateLogin, login);
router.get('/me', protect, getMe);

// Management & stats routes
router.get('/stats', protect, getDashboardStats);
router.get('/review-queue', protect, getReviewQueue);
router.post('/resolve-review', protect, resolveReview);
router.get('/import-reports', protect, getImportReports);

module.exports = router;
