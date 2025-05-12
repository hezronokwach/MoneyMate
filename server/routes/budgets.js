const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');

// Placeholder route
router.get('/', authenticate, (req, res) => {
  res.json({ message: 'Budgets route' });
});

module.exports = router;