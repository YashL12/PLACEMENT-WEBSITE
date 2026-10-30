const express = require('express');
const router = express.Router();
const {
  getCodingQuestions,
  getCodingMeta,
  getCodingStats,
  getCodingQuestionBySlug,
  getCodingQuestionSolution,
} = require('../controllers/codingQuestionController');

// GET /api/coding-questions/meta — reference data + total count (cached)
router.get('/meta', getCodingMeta);

// GET /api/coding-questions/stats — aggregate stats for dashboard
router.get('/stats', getCodingStats);

// GET /api/coding-questions — paginated list (cards only, no solutions)
router.get('/', getCodingQuestions);

// GET /api/coding-questions/:slug — full question detail (no solutions)
router.get('/:slug', getCodingQuestionBySlug);

// GET /api/coding-questions/:slug/solution?lang=java|javascript|python
router.get('/:slug/solution', getCodingQuestionSolution);

module.exports = router;
