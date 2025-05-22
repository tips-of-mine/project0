// pulsur/finance-app/src/api/routes.js
const express = require('express');
const router = express.Router();
const financeController = require('./financeController');

// Payment Methods
router.post('/finance/payment-methods', financeController.addPaymentMethod);
router.get('/finance/payment-methods', financeController.listPaymentMethods); // Needs userId query param
router.post('/finance/payment-methods/:paymentMethodId/validate', financeController.validatePaymentMethod);

// Invoices (Client facing)
router.get('/finance/invoices', financeController.listInvoices); // Needs userId query param
router.get('/finance/invoices/:invoiceId', financeController.getInvoiceDetails); // Potentially needs userId for auth

// Invoices (Admin facing)
router.get('/finance/admin/invoices', financeController.listInvoices); // Controller logic handles filtering
router.get('/finance/admin/invoices/:invoiceId', financeController.getInvoiceDetails); // Controller logic handles access

// Mock endpoint for triggering payment & invoicing simulation
router.post('/finance/internal/mock-process-payment', financeController.processPaymentAndGenerateInvoice);


module.exports = router;
