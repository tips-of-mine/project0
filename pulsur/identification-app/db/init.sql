-- Database schema for the Identification Application (identification-app)

-- Users table: Stores user credentials, roles, subscription details, and status.
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- e.g., 'Admin', 'Client_Principal', 'Client_User'
    subscription_type VARCHAR(50), -- e.g., 'Free', 'Basic', 'Pro', 'Enterprise'
    company VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for faster lookups on frequently queried columns.
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_login ON users(login);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Future tables for the identification-app might include:
-- - password_reset_tokens
-- - email_verification_tokens
-- - audit_logs for security-sensitive actions

COMMENT ON TABLE users IS 'Stores all user account information including credentials, roles, and subscription status.';
COMMENT ON COLUMN users.id IS 'Unique identifier for the user.';
COMMENT ON COLUMN users.login IS 'User''s chosen login name, must be unique.';
COMMENT ON COLUMN users.password_hash IS 'Hashed password for the user.';
COMMENT ON COLUMN users.role IS 'Defines the user''s role and permissions within the system (e.g., Admin, Client_Principal, Client_User).';
COMMENT ON COLUMN users.subscription_type IS 'Type of subscription plan the user/company is on (e.g., Free, Basic, Pro, Enterprise).';
COMMENT ON COLUMN users.company IS 'Name of the company the user belongs to, if applicable.';
COMMENT ON COLUMN users.email IS 'User''s email address, must be unique.';
COMMENT ON COLUMN users.is_active IS 'Boolean flag to indicate if the user account is active or disabled.';
COMMENT ON COLUMN users.created_at IS 'Timestamp of when the user account was created.';
COMMENT ON COLUMN users.updated_at IS 'Timestamp of the last update to the user account information.';
