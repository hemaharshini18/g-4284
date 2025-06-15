const express = require('express');
const router = express.Router();
const { getChatbotResponse } = require('../services/chatbotService');

// @route   POST api/chatbot/message
// @desc    Get a response from the HR chatbot
// @access  Private
router.post('/message', (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ msg: 'Message is required' });
  }

  const response = getChatbotResponse(message);
  res.json({ response });
});

module.exports = router;
