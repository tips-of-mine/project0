-- pulsur/finance-app/db/init.sql

-- Database schema for the Finance Application (finance-app)
-- This schema will store data related to financial transactions, subscriptions,
-- billing, payment processing, and client account credits/balances.

-- Table for Client Operating Credits
-- Stores the current operating credit or balance for each client account (or user).
-- This is queried by the Identification App during login.
CREATE TABLE IF NOT EXISTS client_credits (
    id SERIAL PRIMARY KEY,
    client_user_id VARCHAR(255) UNIQUE NOT NULL, -- Corresponds to the user ID from Identification App. Using VARCHAR to match example 'user-abc-123'.
                                             -- If user IDs are integers, this should be INTEGER.
    credit_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR', -- ISO 4217 currency code
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT -- Optional notes, e.g., manual adjustments
);

COMMENT ON TABLE client_credits IS 'Stores the operating credit balance for client accounts.';
COMMENT ON COLUMN client_credits.client_user_id IS 'Unique identifier for the client/user, linking to the Identification App''s user ID.';
COMMENT ON COLUMN client_credits.credit_balance IS 'The current available credit balance for the client/user.';
COMMENT ON COLUMN client_credits.currency IS 'ISO 4217 currency code for the balance (e.g., EUR, USD).';
COMMENT ON COLUMN client_credits.last_updated_at IS 'Timestamp of when the credit balance was last updated.';

-- Table for Stored Payment Methods (Tokenized)
CREATE TABLE IF NOT EXISTS payment_methods (
    id SERIAL PRIMARY KEY, -- Or UUID if preferred: id UUID PRIMARY KEY DEFAULT gen_random_uuid()
    client_user_id VARCHAR(255) NOT NULL, -- Corresponds to the user ID from Identification App
    gateway_customer_id VARCHAR(255), -- ID for the customer object in the payment gateway, if applicable
    gateway_payment_method_token VARCHAR(255) NOT NULL UNIQUE, -- The token from the payment gateway (e.g., Stripe's pm_xxx or tok_xxx if it's a one-time token meant to be converted to a payment method)
                                                            -- Ensure this is the *persistent* payment method token/ID if available, not just a one-time use token.
    card_type VARCHAR(50), -- e.g., 'Visa', 'Mastercard', 'Amex'
    last_four_digits VARCHAR(4),
    expiry_month INTEGER,
    expiry_year INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    billing_name VARCHAR(255), -- Name on card, if collected and needed
    billing_address_line1 VARCHAR(255),
    billing_address_postal_code VARCHAR(20),
    -- Add other billing address fields if collected (line2, city, state, country)
    status VARCHAR(50) DEFAULT 'active', -- e.g., 'active', 'expired', 'revoked_by_user', 'failed_validation'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- For changes like setting default, expiry update
);

COMMENT ON TABLE payment_methods IS 'Stores tokenized payment methods for users, linked to a payment gateway.';
COMMENT ON COLUMN payment_methods.client_user_id IS 'Links to the user in the Identification App.';
COMMENT ON COLUMN payment_methods.gateway_customer_id IS 'Customer ID from the payment gateway, if applicable (e.g., Stripe''s cus_XYZ).';
COMMENT ON COLUMN payment_methods.gateway_payment_method_token IS 'Persistent token/ID for the payment method from the payment gateway (e.g., Stripe''s pm_XYZ). This should NOT be a one-time use token.';
COMMENT ON COLUMN payment_methods.is_default IS 'True if this is the default payment method for the user.';
COMMENT ON COLUMN payment_methods.status IS 'Current status of the payment method.';

-- Index for faster lookup of user's payment methods
CREATE INDEX IF NOT EXISTS idx_pm_client_user_id ON payment_methods(client_user_id);
CREATE INDEX IF NOT EXISTS idx_pm_gateway_token ON payment_methods(gateway_payment_method_token); -- If tokens are globally unique and might be looked up

-- Table for Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY, -- Or UUID
    invoice_number VARCHAR(100) UNIQUE NOT NULL, -- System-generated unique invoice number
    client_user_id VARCHAR(255) NOT NULL, -- The user this invoice is for
    payment_method_id INTEGER REFERENCES payment_methods(id) ON DELETE SET NULL, -- Optional: Link to the payment method used, if applicable
                                                                            -- ON DELETE SET NULL means if payment method is deleted, invoice still exists but link is broken
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR', -- ISO 4217 currency code
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- e.g., 'draft', 'sent', 'paid', 'overdue', 'void', 'uncollectible'
    notes_to_client TEXT, -- Any notes displayed to the client on the invoice
    internal_notes TEXT, -- Internal notes for accounting/admin
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- For status changes, etc.
);

COMMENT ON TABLE invoices IS 'Stores invoice data for services rendered or subscriptions.';
COMMENT ON COLUMN invoices.invoice_number IS 'Unique, system-generated invoice number.';
COMMENT ON COLUMN invoices.client_user_id IS 'The user account this invoice belongs to.';
COMMENT ON COLUMN invoices.payment_method_id IS 'Reference to the payment method used for this invoice, if any.';
COMMENT ON COLUMN invoices.status IS 'Current status of the invoice (e.g., draft, sent, paid, overdue).';

-- Indexes for invoices table
CREATE INDEX IF NOT EXISTS idx_invoices_client_user_id ON invoices(client_user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

-- Table for Invoice Line Items
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id SERIAL PRIMARY KEY, -- Or UUID
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE, -- If an invoice is deleted, its line items are also deleted.
    description TEXT NOT NULL, -- Description of the service or product
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL, -- Calculated as quantity * unit_price, but stored for historical accuracy
    -- Optional: product_code or service_code if linking to a catalog
    -- product_code VARCHAR(100), 
    -- Optional: tax_rate DECIMAL(5,2), tax_amount DECIMAL(10,2)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE invoice_line_items IS 'Stores individual line items for each invoice.';
COMMENT ON COLUMN invoice_line_items.invoice_id IS 'Foreign key linking to the parent invoice.';
COMMENT ON COLUMN invoice_line_items.total_price IS 'Stores the calculated total for this line item (quantity * unit_price).';

-- Indexes for invoice_line_items table
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);
-- CREATE INDEX IF NOT EXISTS idx_invoice_line_items_product_code ON invoice_line_items(product_code); -- If using product_code

-- Future tables for finance-app might include:
-- - subscriptions (plan details, start/end dates, status)
-- CREATE TABLE IF NOT EXISTS subscriptions (
--     id SERIAL PRIMARY KEY,
--     client_user_id VARCHAR(255) NOT NULL REFERENCES client_credits(client_user_id), -- Or direct link to user ID
--     plan_id VARCHAR(100) NOT NULL, -- e.g., 'Free', 'Basic', 'Pro', 'Enterprise'
--     status VARCHAR(50) NOT NULL, -- e.g., 'active', 'lapsed', 'cancelled'
--     start_date DATE NOT NULL,
--     end_date DATE,
--     renewal_date DATE,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );
-- COMMENT ON TABLE subscriptions IS 'Manages client subscriptions to various service plans.';

-- - transactions (payment records)
-- CREATE TABLE IF NOT EXISTS transactions (
--     id SERIAL PRIMARY KEY,
--     invoice_id INTEGER REFERENCES invoices(id),
--     transaction_type VARCHAR(50) NOT NULL, -- e.g., 'payment', 'refund', 'credit_adjustment'
--     amount DECIMAL(10, 2) NOT NULL,
--     currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
--     transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     payment_method_details TEXT, -- e.g., card type, last 4 digits
--     status VARCHAR(50) NOT NULL, -- e.g., 'succeeded', 'pending', 'failed'
--     external_transaction_id VARCHAR(255) -- ID from payment gateway
-- );
-- COMMENT ON TABLE transactions IS 'Records all financial transactions like payments and refunds.';
