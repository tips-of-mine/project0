// pulsur/user-interface-app/src/api/userFinanceController.js
const axios = require('axios');

// Assume finance-app is running on localhost:3003 for now
const FINANCE_APP_URL = 'http://localhost:3003/api/finance'; 
const MOCK_SERVICE_TOKEN = 'service-token-for-ui-to-finance'; // Mock token

// This simulates the part of user-interface-app's backend that handles payment method additions.
// The conceptual client-side JS part (interacting with Gateway SDK) is not implemented here.
const addPaymentMethod = async (req, res, next) => {
  try {
    // Assume req.body contains what client-side JS would send after getting token from gateway:
    // { userId (of logged in user), gatewayToken, cardType, lastFourDigits, expiryMonth, expiryYear, isDefault }
    const { userId, gatewayToken, cardType, lastFourDigits, expiryMonth, expiryYear, isDefault } = req.body;

    if (!userId || !gatewayToken) {
      return res.status(400).json({ message: 'userId and gatewayToken are required from client.' });
    }

    // Call finance-app to actually store the payment method
    const financeApiResponse = await axios.post(`${FINANCE_APP_URL}/payment-methods`, 
      { // Payload for finance-app
        userId, 
        gatewayToken, 
        cardType, 
        lastFourDigits, 
        expiryMonth, 
        expiryYear, 
        isDefault 
      },
      { headers: { 'X-Service-Token': MOCK_SERVICE_TOKEN } } // Authenticate to finance-app
    );
    
    // Forward response from finance-app to the original client (UI frontend)
    res.status(financeApiResponse.status).json(financeApiResponse.data);

  } catch (error) {
    console.error('Error in UI app calling finance app (addPaymentMethod):', error.response ? error.response.data : error.message);
    const status = error.response ? error.response.status : 500;
    const message = error.response ? error.response.data.message || 'Error calling finance service.' : 'Internal server error.';
    res.status(status).json({ message });
    // next(error); // Or use the app's central error handler
  }
};

const listPaymentMethods = async (req, res, next) => {
  try {
    const { userId } = req.query; // userId of the logged-in user
    if (!userId) {
      return res.status(400).json({ message: 'userId query parameter is required.' });
    }

    const financeApiResponse = await axios.get(`${FINANCE_APP_URL}/payment-methods`, {
      params: { userId },
      headers: { 'X-Service-Token': MOCK_SERVICE_TOKEN }
    });
    res.status(financeApiResponse.status).json(financeApiResponse.data);
  } catch (error) {
    console.error('Error in UI app calling finance app (listPaymentMethods):', error.response ? error.response.data : error.message);
    const status = error.response ? error.response.status : 500;
    const message = error.response ? error.response.data.message || 'Error calling finance service.' : 'Internal server error.';
    res.status(status).json({ message });
  }
};

const listInvoices = async (req, res, next) => {
  try {
    const { userId, status: queryStatus } = req.query; // userId of the logged-in user
    if (!userId) {
      return res.status(400).json({ message: 'userId query parameter is required.' });
    }
    
    const financeApiResponse = await axios.get(`${FINANCE_APP_URL}/invoices`, {
      params: { userId, status: queryStatus },
      headers: { 'X-Service-Token': MOCK_SERVICE_TOKEN }
    });
    res.status(financeApiResponse.status).json(financeApiResponse.data);
  } catch (error) {
    console.error('Error in UI app calling finance app (listInvoices):', error.response ? error.response.data : error.message);
    const status = error.response ? error.response.status : 500;
    const message = error.response ? error.response.data.message || 'Error calling finance service.' : 'Internal server error.';
    res.status(status).json({ message });
  }
};

const getInvoiceDetails = async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    // const { userId } = req.query; // Important: UI backend must ensure this invoice belongs to the logged-in user.
                                 // This might involve getting userId from session/JWT.
                                 // For now, finance-app doesn't strictly enforce it on this specific endpoint if called with ServiceToken.

    const financeApiResponse = await axios.get(`${FINANCE_APP_URL}/invoices/${invoiceId}`, {
      headers: { 'X-Service-Token': MOCK_SERVICE_TOKEN }
      // If finance-app's GET /invoices/{invoiceId} also required userId for auth even with ServiceToken:
      // params: { userId } 
    });
    res.status(financeApiResponse.status).json(financeApiResponse.data);
  } catch (error) {
    console.error('Error in UI app calling finance app (getInvoiceDetails):', error.response ? error.response.data : error.message);
    const status = error.response ? error.response.status : 500;
    const message = error.response ? error.response.data.message || 'Error calling finance service.' : 'Internal server error.';
    res.status(status).json({ message });
  }
};

// Placeholder for receiving notifications from finance-app
const receivePaymentMethodValidationNotification = async (req, res, next) => {
    try {
        console.log('User Interface App: Received payment method validation notification:', req.body);
        // TODO: Implement logic to handle this notification
        // e.g., update user via WebSocket, store notification for user display
        res.status(202).json({ status: "notification_received_by_ui_app" });
    } catch (error) {
        next(error);
    }
};


module.exports = {
  addPaymentMethod,
  listPaymentMethods,
  listInvoices,
  getInvoiceDetails,
  receivePaymentMethodValidationNotification
};
