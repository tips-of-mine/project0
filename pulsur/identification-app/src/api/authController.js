// pulsur/identification-app/src/api/authController.js
const bcrypt = require('bcryptjs');

// In-memory store for users (replace with database interaction later)
let users = []; 
let userIdCounter = { value: 1 }; // Use an object to allow modification by reference

const register = async (req, res) => {
  const { login, password, email, subscription_type, company } = req.body;

  // Basic validation
  if (!login || !password || !email || !subscription_type) {
    return res.status(400).json({ message: 'Missing required fields: login, password, email, subscription_type.' });
  }

  // Check if user already exists (by login or email)
  if (users.find(u => u.login === login || u.email === email)) {
    return res.status(409).json({ message: 'User with this login or email already exists.' });
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
    
    return res.status(201).json(responseUser);

  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ message: 'Internal server error during registration.' });
  }
};

const login = async (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ message: 'Missing login or password.' });
  }

  const user = users.find(u => u.login === login);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials. User not found.' });
  }

  if (!user.is_active) {
    return res.status(403).json({ message: 'Account is inactive. Please contact support.' });
  }

  try {
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Password mismatch.' });
    }

    // Simulate checking "crédit de fonctionnement"
    // For MVP, allow 'Client_Principal' to login regardless of credit.
    // Other roles would need a credit check against finance-app (to be implemented).
    let hasSufficientCredit = true; // Assume true for now
    if (user.role !== 'Client_Principal') {
      // TODO: Call finance-app to check credit status.
      // For now, we can simulate: e.g. hasSufficientCredit = user.email.includes('hascredit'); 
      console.log(`User ${user.login} (role: ${user.role}) - would require credit check.`);
    }

    if (!hasSufficientCredit) {
      return res.status(403).json({ message: 'Insufficient operating credit. Please contact your account administrator.'});
    }

    // Generate a placeholder session token (simple UUID or similar for now)
    // Real JWT implementation is a future step.
    const placeholderToken = `token-${Date.now()}-${user.id}`; 
                             // In a real app, use a library like jsonwebtoken

    // Prepare response as per openapi.yaml (UserLoginResponse)
    const loginResponse = {
      token: placeholderToken,
      user: {
        id: user.id,
        login: user.login,
        role: user.role,
        // Add other relevant user details from 'user' object if needed by client
      },
      message: "Login successful."
    };

    return res.status(200).json(loginResponse);

  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Internal server error during login.' });
  }
};

module.exports = {
  register,
  login,
  users_for_test: users, // Export for test inspection/manipulation
  userIdCounter_for_test: userIdCounter // Export for test inspection/manipulation
};
