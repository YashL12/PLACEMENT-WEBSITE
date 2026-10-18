const express = require('express');
const router = express.Router();
const {
  getRounds,
  createRound,
  updateRound,
  deleteRound,
} = require('../controllers/roundController');
const { protect } = require('../middleware/auth');

router.get('/', getRounds);
router.post('/', protect, createRound);
router.put('/:id', protect, updateRound);
router.delete('/:id', protect, deleteRound);

module.exports = router;
