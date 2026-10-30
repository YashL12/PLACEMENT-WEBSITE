const express = require('express');
const router = express.Router();
const executeCode = require('../controllers/executeController');

// POST /api/execute — proxy code execution to external provider
router.post('/', executeCode);

module.exports = router;
