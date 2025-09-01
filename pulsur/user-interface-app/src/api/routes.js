// pulsur/user-interface-app/src/api/routes.js
const express = require('express');
const router = express.Router();
const userFinanceController = require('./userFinanceController');

// These routes are prefixed with /api/ui in index.js
// Corresponds to conceptual UI interactions leading to finance operations

// Payment Methods (as called by this app's frontend)
// Path could be e.g. /payment-methods, matching the conceptual interaction point for UI's frontend
router.post('/payment-methods', userFinanceController.addPaymentMethod); 
router.get('/payment-methods', userFinanceController.listPaymentMethods); // Expects userId in query from its own frontend

// Invoices (as called by this app's frontend)
router.get('/invoices', userFinanceController.listInvoices); // Expects userId in query
router.get('/invoices/:invoiceId', userFinanceController.getInvoiceDetails);

// Internal notification endpoint (as defined in OpenAPI for finance-app to call)
// Path should exactly match openapi.yaml: /ui/internal/notifications/payment-method-validated
// Note: index.js mounts all these under /api/ui. So the route here should be relative to that.
router.post('/internal/notifications/payment-method-validated', userFinanceController.receivePaymentMethodValidationNotification);


module.exports = router;
