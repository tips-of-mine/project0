-- Database schema for the Finance Application (finance-app)
-- This schema will store data related to financial transactions, subscriptions,
-- billing, payment processing, and client account credits/balances.

-- The specific tables are yet to be fully defined based on the MVP features.
-- The brief states: "A pour but de gérer tout les partie financier de l'application"
-- "Elle stoke les information dans la base de données"
-- It also implies management of "crédit de fonctionnement" from the identification-app description.

-- Potential tables might include:
-- - subscriptions (details of active subscriptions, plans, start/end dates)
-- - invoices (billing records sent to clients)
-- - transactions (records of payments, refunds)
-- - client_credits (managing the "crédit de fonctionnement" for client accounts)
-- - payment_gateways (if integrating with multiple payment providers)
-- - financial_ledgers (for accounting purposes)

COMMENT ON SCHEMA public IS 'Schema for finance-app. Specific tables to be defined. Manages subscriptions, billing, payments, client credits, etc.';
