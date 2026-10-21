const express = require('express');
const router = express.Router();
const {
  getCompanies,
  getCompanyById,
  getPublicStats,
  createCompany,
  updateCompany,
  deleteCompany,
} = require('../controllers/companyController');
const { protect } = require('../middleware/auth');
const { validateCompany } = require('../validators/companyValidator');

// Public routes
router.get('/', getCompanies);
router.get('/stats/summary', getPublicStats);
router.get('/:id', getCompanyById);

// Protected Admin routes
router.post('/', protect, validateCompany, createCompany);
router.put('/:id', protect, updateCompany);
router.delete('/:id', protect, deleteCompany);

module.exports = router;
