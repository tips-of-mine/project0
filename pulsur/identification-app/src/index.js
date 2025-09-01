// pulsur/identification-app/src/index.js
const express = require('express');
const config = require('../config.json'); // Corrected path
const apiRoutes = require('./api/routes');

const app = express();
const PORT = process.env.PORT || 3000; 

app.use(express.json()); 

app.get('/', (req, res) => {
  res.send('Identification App is running.');
});

app.use('/api', apiRoutes);

// Centralized Error Handling Middleware
// This should be defined AFTER all other app.use() and routes calls
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack || err.message || err); // Log the error stack for debugging

  // Check if headers have already been sent, in which case delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Respond with a generic 500 error
  // Customize error response based on error type if needed (e.g., err.statusCode)
  res.status(err.statusCode || 500).json({
    message: err.message || 'An unexpected internal server error occurred.',
    // Optionally, include error code or other details in development
    ...(process.env.NODE_ENV === 'development' && { errorDetails: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log(`Identification App started on port ${PORT}`);
  // console.log('Current config:', config); // Config logging can be verbose, optional
});
