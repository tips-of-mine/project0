// src/api/routes.js
const express = require('express');
const router = express.Router();

router.post('/register', (req, res) => {
  // TODO: Implement registration logic
  res.status(501).json({ message: 'Register endpoint not implemented yet.' });
});

router.post('/login', (req, res) => {
  // TODO: Implement login logic
  res.status(501).json({ message: 'Login endpoint not implemented yet.' });
});

module.exports = router;
