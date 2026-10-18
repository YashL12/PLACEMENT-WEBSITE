const express = require('express');
const router = express.Router();
const {
  getExperiences,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience,
} = require('../controllers/experienceController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getExperiences);
router.get('/:id', getExperienceById);

// Protected Admin routes
router.post('/', protect, createExperience);
router.put('/:id', protect, updateExperience);
router.delete('/:id', protect, deleteExperience);

module.exports = router;
