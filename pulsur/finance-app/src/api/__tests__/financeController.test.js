// pulsur/finance-app/src/api/__tests__/financeController.test.js
const { 
    addPaymentMethod, 
    listPaymentMethods, 
    validatePaymentMethod,
    listInvoices,
    getInvoiceDetails,
    processPaymentAndGenerateInvoice, // For testing invoice creation indirectly
    // Export these from financeController.js for test manipulation:
    paymentMethods_for_test, 
    pmIdCounter_for_test,
    invoices_for_test,
    invoiceIdCounter_for_test,
    invoiceLineItems_for_test,
    lineItemIdCounter_for_test
} = require('../financeController');

const mockRequest = (body = {}, query = {}, params = {}, path = '') => ({ body, query, params, path });
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

describe('Finance Controller - Payment Methods', () => {
  beforeEach(() => {
    // Reset in-memory stores
    paymentMethods_for_test.length = 0;
    pmIdCounter_for_test.value = 1;
  });

  it('should add a payment method', async () => {
    const req = mockRequest({ userId: 'user1', gatewayToken: 'tok_test123', cardType: 'Visa', lastFourDigits: '1234' });
    const res = mockResponse();
    await addPaymentMethod(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user1', gatewayToken: 'tok_test123' }));
    expect(paymentMethods_for_test.length).toBe(1);
  });

  it('should list payment methods for a user', async () => {
    // Add some payment methods
    await addPaymentMethod(mockRequest({ userId: 'user1', gatewayToken: 'tok_a' }), mockResponse(), mockNext);
    await addPaymentMethod(mockRequest({ userId: 'user2', gatewayToken: 'tok_b' }), mockResponse(), mockNext);
    await addPaymentMethod(mockRequest({ userId: 'user1', gatewayToken: 'tok_c' }), mockResponse(), mockNext);

    const req = mockRequest({}, { userId: 'user1' });
    const res = mockResponse();
    await listPaymentMethods(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(200);
    const pms = res.json.mock.calls[0][0];
    expect(pms.length).toBe(2);
    expect(pms[0].gatewayToken).toBe('tok_a');
    expect(pms[1].gatewayToken).toBe('tok_c');
  });

  it('should validate a payment method (simulated)', async () => {
    const addRes = mockResponse();
    await addPaymentMethod(mockRequest({ userId: 'user1', gatewayToken: 'tok_valid' }), addRes, mockNext);
    const pmId = addRes.json.mock.calls[0][0].id;

    const req = mockRequest({}, {}, { paymentMethodId: pmId });
    const res = mockResponse();
    await validatePaymentMethod(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ paymentMethodId: pmId, status: 'active' }));
  });
});

describe('Finance Controller - Invoices', () => {
    beforeEach(() => {
        paymentMethods_for_test.length = 0;
        pmIdCounter_for_test.value = 1;
        invoices_for_test.length = 0;
        invoiceIdCounter_for_test.value = 1;
        invoiceLineItems_for_test.length = 0;
        lineItemIdCounter_for_test.value = 1;

        // Add a payment method for invoice tests
        addPaymentMethod(mockRequest({ userId: 'user1', gatewayToken: 'tok_for_invoice'}), mockResponse(), mockNext);
    });

    it('should create and list invoices', async () => {
        const pmId = paymentMethods_for_test[0].id;
        // Simulate payment and invoice generation
        await processPaymentAndGenerateInvoice(mockRequest({ 
            userId: 'user1', amount: 100, currency: 'USD', paymentMethodId: pmId, 
            items: [{ description: 'Test Service', quantity: 1, unit_price: 100 }] 
        }), mockResponse(), mockNext);
        
        expect(invoices_for_test.length).toBe(1);
        const invoice = invoices_for_test[0];
        expect(invoice.total_amount).toBe(100);
        expect(invoice.line_items.length).toBe(1);

        const reqList = mockRequest({}, { userId: 'user1' }, {}, '/finance/invoices');
        const resList = mockResponse();
        await listInvoices(reqList, resList, mockNext);
        expect(resList.status).toHaveBeenCalledWith(200);
        const listedInvoices = resList.json.mock.calls[0][0];
        expect(listedInvoices.length).toBe(1);
        expect(listedInvoices[0].invoice_number).toBe(invoice.invoice_number);
    });

    it('should get invoice details', async () => {
        const pmId = paymentMethods_for_test[0].id;
        const createdInvoiceRes = mockResponse();
        await processPaymentAndGenerateInvoice(mockRequest({ 
            userId: 'user1', amount: 150, currency: 'USD', paymentMethodId: pmId,
            items: [{ description: 'Another Service', quantity: 1, unit_price: 150 }]
        }), createdInvoiceRes, mockNext);
        const invoiceId = createdInvoiceRes.json.mock.calls[0][0].invoice.id;

        const req = mockRequest({}, {}, { invoiceId: invoiceId });
        const res = mockResponse();
        await getInvoiceDetails(req, res, mockNext);
        expect(res.status).toHaveBeenCalledWith(200);
        const details = res.json.mock.calls[0][0];
        expect(details.id).toBe(invoiceId);
        expect(details.total_amount).toBe(150);
        expect(details.line_items.length).toBe(1);
    });
});
