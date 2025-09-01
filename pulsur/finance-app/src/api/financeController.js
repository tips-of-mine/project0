// pulsur/finance-app/src/api/financeController.js
// For testing:
let paymentMethods_for_test = []; 
let pmIdCounter_for_test = { value: 1 };
let invoices_for_test = [];
let invoiceIdCounter_for_test = { value: 1 };
let invoiceLineItems_for_test = [];
let lineItemIdCounter_for_test = { value: 1 };

// --- Payment Methods ---
const addPaymentMethod = async (req, res, next) => {
  try {
    const { userId, gatewayToken, cardType, lastFourDigits, expiryMonth, expiryYear, isDefault } = req.body;
    if (!userId || !gatewayToken) {
      return res.status(400).json({ message: 'userId and gatewayToken are required.' });
    }

    // Simulate gateway validation success for now
    const newPM = {
      id: `pm_${pmIdCounter_for_test.value++}`,
      userId,
      gatewayToken, // In real scenario, this might be different from what's stored (e.g. if gateway transforms it)
      cardType: cardType || 'Unknown',
      lastFourDigits: lastFourDigits || '0000',
      expiryMonth: expiryMonth || '01',
      expiryYear: expiryYear || '2099',
      isDefault: isDefault || false,
      gatewayCustomerId: `cus_${userId.substring(5)}`, // Mock
      status: 'active', // Assume validated for now
      createdAt: new Date().toISOString(),
    };
    paymentMethods_for_test.push(newPM);
    // If isDefault is true, ensure other payment methods for this user are not default
    if (newPM.isDefault) {
        paymentMethods_for_test.forEach(pm => {
            if (pm.userId === userId && pm.id !== newPM.id) {
                pm.isDefault = false;
            }
        });
    }
    console.log('Added payment method:', newPM);
    res.status(201).json(newPM);
  } catch (error) {
    next(error);
  }
};

const listPaymentMethods = async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'userId query parameter is required.' });
    }
    const userPMs = paymentMethods_for_test.filter(pm => pm.userId === userId);
    // Ensure we don't send sensitive parts of the token if gatewayToken itself was sensitive
    // For now, PaymentMethodDetails schema doesn't include the token itself, just its ID.
    res.status(200).json(userPMs);
  } catch (error) {
    next(error);
  }
};

const validatePaymentMethod = async (req, res, next) => {
  try {
    const { paymentMethodId } = req.params;
    const pm = paymentMethods_for_test.find(p => p.id === paymentMethodId);
    if (!pm) {
      return res.status(404).json({ message: 'Payment method not found.' });
    }
    // Simulate validation - in reality, call payment gateway
    pm.status = 'active'; // Assume it becomes active
    pm.lastValidationAttempt = new Date().toISOString();
    console.log('Validated payment method:', pm);
    res.status(200).json({
      paymentMethodId: pm.id,
      status: pm.status,
      lastValidationAttempt: pm.lastValidationAttempt,
      validationMessage: 'Successfully validated (simulated).',
    });
  } catch (error) {
    next(error);
  }
};

// --- Invoices ---
// Conceptual: Simulate creating an invoice after a "payment"
const createInvoiceAfterPayment = (userId, amount, currency, paymentMethodIdUsed, items) => {
    const newInvoice = {
        id: `inv_${invoiceIdCounter_for_test.value++}`,
        invoice_number: `INV-${new Date().getFullYear()}-${String(invoiceIdCounter_for_test.value -1).padStart(5, '0')}`,
        client_user_id: userId,
        payment_method_id: paymentMethodIdUsed,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Due in 30 days
        total_amount: amount,
        currency: currency || 'EUR',
        status: 'paid', // Assuming payment was successful
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        line_items: []
    };
    items.forEach(item => {
        const newLineItem = {
            id: `li_${lineItemIdCounter_for_test.value++}`,
            invoice_id: newInvoice.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.quantity * item.unit_price
        };
        invoiceLineItems_for_test.push(newLineItem);
        newInvoice.line_items.push(newLineItem);
    });
    invoices_for_test.push(newInvoice);
    console.log('Generated invoice:', newInvoice);
    return newInvoice;
};

// Example conceptual payment processing
const processPaymentAndGenerateInvoice = async (req, res, next) => {
    // This is a MOCK endpoint to simulate triggering payment & invoicing
    // In reality, this would be internal logic or triggered by other events.
    try {
        const { userId, amount, currency, paymentMethodId, items } = req.body;
        if (!userId || !amount || !paymentMethodId || !items || !items.length) {
            return res.status(400).json({ message: 'userId, amount, paymentMethodId, and items are required.'});
        }
        const pm = paymentMethods_for_test.find(p => p.id === paymentMethodId && p.userId === userId && p.status === 'active');
        if (!pm) {
            return res.status(404).json({ message: 'Active payment method not found for user.' });
        }

        // Simulate payment gateway charge SUCCESS
        console.log(`Simulating charge of ${amount} ${currency} on PM ${paymentMethodId} for user ${userId}`);
        
        const generatedInvoice = createInvoiceAfterPayment(userId, amount, currency, paymentMethodId, items);
        
        res.status(201).json({ 
            message: "Payment processed (simulated) and invoice generated.", 
            invoice: generatedInvoice 
        });
    } catch (error) {
        next(error);
    }
};


const listInvoices = async (req, res, next) => {
  try {
    const { userId, status: queryStatus } = req.query; // userId from query for client, or no userId for admin to get all
    let userInvoices = invoices_for_test;
    if (userId) { // For client /finance/invoices?userId=...
        userInvoices = invoices_for_test.filter(inv => inv.client_user_id === userId);
    }
    // For admin /finance/admin/invoices?clientUserId=... (assuming clientUserId maps to userId here)
    const adminClientUserId = req.query.clientUserId; 
    if (req.path.startsWith('/admin') && adminClientUserId) {
         userInvoices = invoices_for_test.filter(inv => inv.client_user_id === adminClientUserId);
    } else if (req.path.startsWith('/admin') && !adminClientUserId) {
        userInvoices = invoices_for_test; // Admin gets all if no specific clientUserId
    }


    if (queryStatus) {
      userInvoices = userInvoices.filter(inv => inv.status === queryStatus);
    }
    // Map to InvoiceListResponseItem (summary)
    const summaryInvoices = userInvoices.map(inv => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        client_user_id: inv.client_user_id,
        issue_date: inv.issue_date,
        due_date: inv.due_date,
        total_amount: inv.total_amount,
        currency: inv.currency,
        status: inv.status,
    }));
    res.status(200).json(summaryInvoices);
  } catch (error) {
    next(error);
  }
};

const getInvoiceDetails = async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    // const { userId } = req.query; // For auth check if needed for client endpoint

    const invoice = invoices_for_test.find(inv => inv.id === invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }

    // For client endpoint, ensure invoice belongs to user (authz check would be in real app)
    // if (userId && invoice.client_user_id !== userId) {
    //   return res.status(403).json({ message: 'Forbidden: Invoice does not belong to user.' });
    // }
    
    // Attach line items (already part of the in-memory invoice structure here)
    // If line items were separate, fetch them:
    // invoice.line_items = invoiceLineItems_for_test.filter(li => li.invoice_id === invoice.id);

    // Get payment method details (non-sensitive part)
    let paymentMethodUsedDetails = null;
    if (invoice.payment_method_id) {
        const pm = paymentMethods_for_test.find(p => p.id === invoice.payment_method_id);
        if (pm) {
            paymentMethodUsedDetails = {
                id: pm.id,
                userId: pm.userId, // This is client_user_id
                cardType: pm.cardType,
                lastFourDigits: pm.lastFourDigits,
                expiryMonth: pm.expiryMonth,
                expiryYear: pm.expiryYear,
                isDefault: pm.isDefault
            };
        }
    }
    
    const detailedInvoice = { ...invoice, payment_method_details: paymentMethodUsedDetails };
    res.status(200).json(detailedInvoice);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addPaymentMethod,
  listPaymentMethods,
  validatePaymentMethod,
  processPaymentAndGenerateInvoice, // Mock endpoint
  listInvoices,
  getInvoiceDetails,
  // Exports for testing
  paymentMethods_for_test,
  pmIdCounter_for_test,
  invoices_for_test,
  invoiceIdCounter_for_test,
  invoiceLineItems_for_test,
  lineItemIdCounter_for_test
};
