// pulsur/user-interface-app/src/index.js
const express = require('express');
const config = require('../config.json');
const apiRoutes = require('./api/routes'); // To be created

const app = express();
const PORT = process.env.USER_INTERFACE_APP_PORT || 3001; // Example port

app.use(express.json());

app.get('/', (req, res) => {
  res.send('User Interface App is running.');
});

app.use('/api/ui', apiRoutes); // Mount API routes under /api/ui prefix to match OpenAPI for UI

// Basic Error Handler
app.use((err, req, res, next) => {
  console.error('User Interface App Error:', err.stack || err.message || err);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error in User Interface App.',
  });
});

app.listen(PORT, () => {
  console.log(`User Interface App started on port ${PORT}`);
});
