const express = require('express');
const router = express.Router();
const {
  getAlumni,
  getAlumniById,
  createAlumni,
  updateAlumni,
  deleteAlumni,
  toggleFeaturedAlumni,
} = require('../controllers/alumniController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getAlumni);
router.get('/:id', getAlumniById);

// Protected Admin routes
router.post('/', protect, createAlumni);
router.put('/:id', protect, updateAlumni);
router.delete('/:id', protect, deleteAlumni);
router.patch('/:id/featured', protect, toggleFeaturedAlumni);

module.exports = router;
