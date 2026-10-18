const express = require('express');
const router = express.Router();
const {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require('../controllers/questionController');
const { protect } = require('../middleware/auth');

router.get('/', getQuestions);
router.post('/', protect, createQuestion);
router.put('/:id', protect, updateQuestion);
router.delete('/:id', protect, deleteQuestion);

module.exports = router;
