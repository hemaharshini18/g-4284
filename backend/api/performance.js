const express = require('express');
const router = express.Router();

// Placeholder for AI-powered feedback generation
const generateAIFeedback = async (performanceData) => {
  // In a real application, this would call a generative AI model (e.g., OpenAI's GPT)
  // For now, we'll return a mock response based on the input.
  const { rating, comments } = performanceData;

  let feedback = 'Thank you for your contribution this quarter.';

  if (rating >= 4) {
    feedback += ` Your performance has been outstanding, particularly in the areas mentioned in your comments: "${comments}". Keep up the excellent work.`;
  } else if (rating >= 3) {
    feedback += ` You have met expectations and demonstrated solid performance. Your work on "${comments}" is appreciated.`;
  } else {
    feedback += ` There are opportunities for improvement. Let's focus on the areas discussed: "${comments}".`;
  }

  return feedback;
};

// @route   POST api/performance/generate-feedback
// @desc    Generate AI-powered performance feedback
// @access  Private
router.post('/generate-feedback', async (req, res) => {
  try {
    const { rating, comments } = req.body;

    if (!rating || !comments) {
      return res.status(400).json({ msg: 'Please provide rating and comments' });
    }

    const performanceData = { rating, comments };
    const feedback = await generateAIFeedback(performanceData);

    res.json({ feedback });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
