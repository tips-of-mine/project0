# Identification App

This application is responsible for managing user identification and authentication within the Pulsur platform. It handles user registration, login, and stores user credentials and related information.

## Database Schema

The application uses a PostgreSQL database to store user data. The schema for the `users` table is defined as follows:

```sql
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

-- Add an index on email and login for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_login ON users(login);
```

This schema is designed to store essential user information, including credentials for authentication, user roles for authorization, subscription details, and contact information. Indexes on `email` and `login` fields are included to optimize query performance for common lookup operations.
