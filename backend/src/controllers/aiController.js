const fs = require('fs');
const { analyzeIssue } = require('../utils/aiEngine');

// @desc Analyze an uploaded civic issue photo (no complaint created yet)
// @route POST /api/ai/analyze
const analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'An image file is required' });
    }
    const { description = '' } = req.body;
    const buffer = fs.readFileSync(req.file.path);

    const analysis = analyzeIssue({ description, buffer });

    res.json({
      analysis,
      image: `/uploads/${req.file.filename}`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { analyzeImage };
