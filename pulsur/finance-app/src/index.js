// pulsur/finance-app/src/index.js
const express = require('express');
const config = require('../config.json');
const apiRoutes = require('./api/routes'); // To be created

const app = express();
const PORT = process.env.FINANCE_APP_PORT || 3003; // Example port

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Finance App is running.');
});

app.use('/api', apiRoutes); // Mount API routes

// Basic Error Handler
app.use((err, req, res, next) => {
  console.error('Finance App Error:', err.stack || err.message || err);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error in Finance App.',
  });
});

app.listen(PORT, () => {
  console.log(`Finance App started on port ${PORT}`);
});
