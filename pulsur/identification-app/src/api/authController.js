// pulsur/identification-app/src/api/authController.js
const bcrypt = require('bcryptjs');
const axios = require('axios'); // Add axios

// In-memory store for users (replace with database interaction later)
let users = []; 
let userIdCounter = { value: 1 }; // Use an object to allow modification by reference

const FINANCE_APP_URL = 'http://localhost:3003/api/finance'; // Finance app URL
const MOCK_SERVICE_TOKEN_IDF_TO_FIN = 'service-token-for-idf-to-finance'; // Mock token

const register = async (req, res, next) => { // Added next for error handling consistency
  const { login, password, email, subscription_type, company } = req.body;

  // Basic validation
  if (!login || !password || !email || !subscription_type) {
    const err = new Error('Missing required fields: login, password, email, subscription_type.');
    err.statusCode = 400;
    return next(err);
  }

  // Check if user already exists (by login or email)
  if (users.find(u => u.login === login || u.email === email)) {
    const err = new Error('User with this login or email already exists.');
    err.statusCode = 409;
    return next(err);
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = {
      id: userIdCounter.value++, // Use userIdCounter.value
      login,
      password_hash,
      email,
      subscription_type,
      company: company || null,
      role: (subscription_type === 'Pro' || subscription_type === 'Enterprise') ? 'Client_Principal' : 'Client_User', // Simplified role assignment
      is_active: true, // Or false, pending validation, as per full requirements
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    users.push(newUser);
    console.log('Registered new user:', newUser); // For server-side logging

    // Prepare response as per openapi.yaml (UserRegistrationResponse)
    const responseUser = {
      id: newUser.id,
      login: newUser.login,
      email: newUser.email,
      role: newUser.role,
      subscription_type: newUser.subscription_type,
      message: "User registered successfully. Placeholder for admin validation or next steps."
    };
    
    res.status(201).json(responseUser);

  } catch (error) {
    // Pass bcrypt or other unexpected errors to central handler
    next(error);
  }
};

const login = async (req, res, next) => {
  const { login, password } = req.body;

  if (!login || !password) {
    // Use next for error handling to trigger central error handler
    const err = new Error('Missing login or password.');
    err.statusCode = 400;
    return next(err); // Pass error to central handler
  }

  const user = users.find(u => u.login === login);
  if (!user) {
    const err = new Error('Invalid credentials. User not found.');
    err.statusCode = 401;
    return next(err);
  }

  if (!user.is_active) {
    const err = new Error('Account is inactive. Please contact support.');
    err.statusCode = 403; // Forbidden
    return next(err);
  }

  try {
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const err = new Error('Invalid credentials. Password mismatch.');
      err.statusCode = 401;
      return next(err);
    }

    // Check "crédit de fonctionnement" if user is not 'Client_Principal'
    let hasSufficientCredit = true; 
    if (user.role !== 'Client_Principal') {
      try {
        console.log(`User ${user.login} (role: ${user.role}) - checking credit status with finance-app for userId: ${user.id}`);
        // Note: user.id is currently an integer. The finance app's /internal/user/{userId}/credit-status
        // endpoint might expect a string or specific format. For now, sending the integer ID.
        // This might require alignment between services on User ID format/type for inter-service calls.
        const creditStatusResponse = await axios.get(
          `${FINANCE_APP_URL}/internal/user/${user.id}/credit-status`,
          { headers: { 'X-Service-Token': MOCK_SERVICE_TOKEN_IDF_TO_FIN } }
        );

        if (creditStatusResponse.data && typeof creditStatusResponse.data.hasSufficientCredit === 'boolean') {
          hasSufficientCredit = creditStatusResponse.data.hasSufficientCredit;
        } else {
          // If response is not as expected, err on the side of caution
          console.error('Unexpected response from finance-app credit check:', creditStatusResponse.data);
          hasSufficientCredit = false; 
        }
      } catch (finError) {
        console.error('Error calling finance-app for credit check:', finError.response ? finError.response.data : finError.message);
        // If finance-app is down or error, login should be blocked as per requirements (unless Principal).
        hasSufficientCredit = false; 
      }
    }

    if (!hasSufficientCredit && user.role !== 'Client_Principal') {
      const err = new Error('Insufficient operating credit or system error. Please contact your account administrator.');
      err.statusCode = 403; // Forbidden
      return next(err);
    }

    const placeholderToken = `token-${Date.now()}-${user.id}`;
    const loginResponse = {
      token: placeholderToken,
      user: {
        id: user.id,
        login: user.login,
        role: user.role,
      },
      message: "Login successful."
    };
    res.status(200).json(loginResponse);

  } catch (error) {
    // Pass bcrypt or other unexpected errors to central handler
    next(error); 
  }
};

// Ensure register and login are exported correctly, along with test helpers
module.exports = {
    register,
    login,
    users_for_test: users, 
    userIdCounter_for_test: userIdCounter 
};
