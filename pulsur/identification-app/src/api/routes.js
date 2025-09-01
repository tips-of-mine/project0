// pulsur/identification-app/src/api/routes.js
const express = require('express');
const router = express.Router();
const authController = require('./authController'); // Import the controller

router.post('/auth/register', authController.register); 
router.post('/auth/login', authController.login); // Use the new login function

module.exports = router;
