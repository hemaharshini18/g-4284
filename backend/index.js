// backend/index.js
const express = require('express');
const cors = require('cors');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies

// A simple test route
app.get('/', (req, res) => {
  res.send('HRMS API is running!');
});

// Use API routes
const apiRoutes = require('./api');
app.use('/api', apiRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app; // for testing