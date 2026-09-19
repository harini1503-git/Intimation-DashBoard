const express = require('express');
const router = express.Router();
const requireAdmin = require('../middleware/requireAdmin');
const { getSubmissions, updateStatus } = require('../controllers/adminController');

// All admin routes require a valid JWT
router.use(requireAdmin);

router.get('/submissions', getSubmissions);
router.patch('/submissions/:id/status', updateStatus);

module.exports = router;
