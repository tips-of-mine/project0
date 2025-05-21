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

-- - invoices (billing records)
-- CREATE TABLE IF NOT EXISTS invoices (
--     id SERIAL PRIMARY KEY,
--     subscription_id INTEGER REFERENCES subscriptions(id),
--     issue_date DATE NOT NULL,
--     due_date DATE NOT NULL,
--     amount DECIMAL(10, 2) NOT NULL,
--     currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
--     status VARCHAR(50) NOT NULL, -- e.g., 'draft', 'sent', 'paid', 'overdue'
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );
-- COMMENT ON TABLE invoices IS 'Stores billing invoice records for clients.';

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
