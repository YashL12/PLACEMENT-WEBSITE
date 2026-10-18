const express = require('express');
const router = express.Router();
const {
  getLearningMaterials,
  getLearningMaterialById,
  createLearningMaterial,
  updateLearningMaterial,
  deleteLearningMaterial,
  downloadLearningMaterial,
} = require('../controllers/learningMaterialController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Public routes
router.get('/', getLearningMaterials);
router.get('/:id', getLearningMaterialById);
router.get('/:id/download', downloadLearningMaterial);

// Protected Admin routes
router.post('/', protect, upload.single('file'), createLearningMaterial);
router.put('/:id', protect, upload.single('file'), updateLearningMaterial);
router.delete('/:id', protect, deleteLearningMaterial);

module.exports = router;
