// src/index.js
const express = require('express');
const config = require('../config.json');
const apiRoutes = require('./api/routes');

const app = express();
const PORT = process.env.PORT || 3000; // Or get from config if specified

app.use(express.json()); // Middleware to parse JSON bodies

app.get('/', (req, res) => {
  res.send('Identification App is running.');
});

app.use('/api', apiRoutes); // Mount the API routes

app.listen(PORT, () => {
  console.log(`Identification App started on port ${PORT}`);
  console.log('Current config:', config);
});
