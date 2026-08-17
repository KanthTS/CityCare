const express = require('express');
const { analyzeImage } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/analyze', protect, upload.single('image'), analyzeImage);

module.exports = router;
