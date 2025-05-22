// pulsur/user-interface-app/src/api/__tests__/userFinanceController.test.js
const axios = require('axios');
const { 
    addPaymentMethod, 
    listPaymentMethods,
    listInvoices,
    getInvoiceDetails,
    receivePaymentMethodValidationNotification
} = require('../userFinanceController');

jest.mock('axios'); // Mock axios for all tests in this file

const mockRequest = (body = {}, query = {}, params = {}) => ({ body, query, params });
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

describe('User Finance Controller - Interactions with Finance App', () => {
  beforeEach(() => {
    axios.post.mockReset();
    axios.get.mockReset();
    mockNext.mockReset(); // Reset next mock as well
  });

  it('addPaymentMethod should call finance-app and relay response', async () => {
    const reqBody = { 
        userId: 'user1', 
        gatewayToken: 'tok_ui1', 
        cardType: 'Visa', 
        lastFourDigits: '1234', 
        expiryMonth: '12', 
        expiryYear: '2025', 
        isDefault: false 
    };
    const req = mockRequest(reqBody);
    const res = mockResponse();
    const mockFinanceResponse = { data: { id: 'pm_123', status: 'success' }, status: 201 };
    axios.post.mockResolvedValue(mockFinanceResponse);

    await addPaymentMethod(req, res, mockNext);

    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:3003/api/finance/payment-methods',
      reqBody, // Ensure all expected fields are passed
      { headers: { 'X-Service-Token': 'service-token-for-ui-to-finance' } } // Check headers
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockFinanceResponse.data);
  });
  
  it('listPaymentMethods should call finance-app and relay response', async () => {
    const req = mockRequest({}, { userId: 'user1' });
    const res = mockResponse();
    const mockFinanceResponse = { data: [{ id: 'pm_123' }], status: 200 };
    axios.get.mockResolvedValue(mockFinanceResponse);

    await listPaymentMethods(req, res, mockNext);
    expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:3003/api/finance/payment-methods',
        { 
            params: { userId: 'user1' }, 
            headers: { 'X-Service-Token': 'service-token-for-ui-to-finance' } 
        }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockFinanceResponse.data);
  });

  it('listInvoices should call finance-app and relay response', async () => {
    const req = mockRequest({}, { userId: 'user1', status: 'paid' });
    const res = mockResponse();
    const mockFinanceResponse = { data: [{ id: 'inv_123', status: 'paid' }], status: 200 };
    axios.get.mockResolvedValue(mockFinanceResponse);

    await listInvoices(req, res, mockNext);
    expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:3003/api/finance/invoices',
        { 
            params: { userId: 'user1', status: 'paid' }, 
            headers: { 'X-Service-Token': 'service-token-for-ui-to-finance' } 
        }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockFinanceResponse.data);
  });

  it('getInvoiceDetails should call finance-app and relay response', async () => {
    const req = mockRequest({}, {}, { invoiceId: 'inv_123' });
    const res = mockResponse();
    const mockFinanceResponse = { data: { id: 'inv_123', amount: 100 }, status: 200 };
    axios.get.mockResolvedValue(mockFinanceResponse);

    await getInvoiceDetails(req, res, mockNext);
    expect(axios.get).toHaveBeenCalledWith(
        `http://localhost:3003/api/finance/invoices/inv_123`,
        { 
            headers: { 'X-Service-Token': 'service-token-for-ui-to-finance' } 
        }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockFinanceResponse.data);
  });


  it('receivePaymentMethodValidationNotification should log and respond 202', async () => {
    const req = mockRequest({ userId: 'user1', paymentMethodId: 'pm_123', validationStatus: 'active' });
    const res = mockResponse();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {}); // Mock console.log

    await receivePaymentMethodValidationNotification(req, res, mockNext);
    expect(consoleSpy).toHaveBeenCalledWith('User Interface App: Received payment method validation notification:', req.body);
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith({ status: "notification_received_by_ui_app" });
    consoleSpy.mockRestore();
  });


  it('addPaymentMethod should handle errors from finance-app', async () => {
    const reqBody = { userId: 'user1', gatewayToken: 'tok_err' };
    const req = mockRequest(reqBody);
    const res = mockResponse();
    const mockError = { response: { data: { message: 'Finance Error' }, status: 400 } };
    axios.post.mockRejectedValue(mockError);

    await addPaymentMethod(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Finance Error' });
  });

  it('listPaymentMethods should handle errors from finance-app', async () => {
    const req = mockRequest({}, { userId: 'user1' });
    const res = mockResponse();
    const mockError = { response: { data: { message: 'Finance List Error' }, status: 500 } };
    axios.get.mockRejectedValue(mockError);

    await listPaymentMethods(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Finance List Error' });
  });
});
