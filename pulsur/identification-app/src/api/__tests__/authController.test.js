// pulsur/identification-app/src/api/__tests__/authController.test.js
const { register, login } = require('../authController'); // Adjust path as needed
// To manage the in-memory users array for tests, we might need to:
// 1. Export 'users' array and 'userIdCounter' from authController and reset them in beforeEach.
// 2. Or, structure authController to allow dependency injection for 'users'.
// For this subtask, we'll write tests assuming we can somewhat control/observe the state,
// acknowledging this might need refinement for more robust testing.
// Let's assume `authController.js` is structured as:
// let users = []; let userIdCounter = 1; ... export { users, userIdCounter, register, login }
// Or simply that Jest's environment provides enough isolation per test file run.

// Mock req and res objects for Express controllers
const mockRequest = (body = {}, session = {}, params = {}) => ({
  body,
  session,
  params,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// --- Test for register ---
describe('Auth Controller - Register', () => {
  // Clear the users array before each test if it's a shared module-level variable
  // This requires 'users' to be exported and modifiable from authController.js
  // For now, we'll assume tests are independent enough or run in order for this simple case.
  // A better approach is to export a resetUsers function from authController.
  
  let users_ref; // To store the reference to the users array from controller
  let userIdCounter_ref;

  beforeAll(() => {
    // This is a workaround to access the internal state for testing.
    // Ideally, `users` and `userIdCounter` should be managed differently for testability.
    const controller = require('../authController');
    users_ref = controller.users_for_test; // Assuming you export 'users' as 'users_for_test'
    userIdCounter_ref = controller.userIdCounter_for_test; // And 'userIdCounter' as 'userIdCounter_for_test'
  });

  beforeEach(() => {
    // Reset state before each test
    if (users_ref) {
      users_ref.length = 0; 
    }
    if (userIdCounter_ref) {
      userIdCounter_ref.value = 1; // Assuming userIdCounter is an object { value: 1 }
    }
  });


  it('should register a new user successfully', async () => {
    const req = mockRequest({
      login: 'testuser',
      password: 'password123',
      email: 'test@example.com',
      subscription_type: 'Basic',
      company: 'Test Inc.'
    });
    const res = mockResponse();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      login: 'testuser',
      email: 'test@example.com',
      role: 'Client_User', // Based on 'Basic' subscription
    }));
    // Optionally, check if user is added to the 'users' array if accessible
  });

  it('should return 409 if user already exists', async () => {
    // First registration
    const req1 = mockRequest({ login: 'existinguser', password: 'password1', email: 'exists@example.com', subscription_type: 'Pro' });
    const res1 = mockResponse();
    await register(req1, res1);

    // Attempt to register again
    const req2 = mockRequest({ login: 'existinguser', password: 'password2', email: 'another@example.com', subscription_type: 'Basic' });
    const res2 = mockResponse();
    await register(req2, res2);
    
    expect(res2.status).toHaveBeenCalledWith(409);
    expect(res2.json).toHaveBeenCalledWith({ message: 'User with this login or email already exists.' });
  });

  it('should return 400 for missing required fields', async () => {
    const req = mockRequest({ login: 'testuser' /* other fields missing */ });
    const res = mockResponse();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// --- Test for login ---
describe('Auth Controller - Login', () => {
  let users_ref; 
  let userIdCounter_ref;

  beforeAll(() => {
    const controller = require('../authController');
    users_ref = controller.users_for_test; 
    userIdCounter_ref = controller.userIdCounter_for_test; 
  });
  
  beforeEach(async () => {
    // Reset state and register a user for login tests
    if (users_ref) users_ref.length = 0;
    if (userIdCounter_ref) userIdCounter_ref.value = 1;

    const regReq = mockRequest({ login: 'loginuser', password: 'password123', email: 'login@example.com', subscription_type: 'Pro' });
    const regRes = mockResponse();
    await register(regReq, regRes); // Register a user to test login against
  });

  it('should login an existing user successfully', async () => {
    const req = mockRequest({ login: 'loginuser', password: 'password123' });
    const res = mockResponse();
    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      token: expect.any(String),
      user: expect.objectContaining({ login: 'loginuser', role: 'Client_Principal' }),
    }));
  });

  it('should return 401 for invalid password', async () => {
    const req = mockRequest({ login: 'loginuser', password: 'wrongpassword' });
    const res = mockResponse();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should return 401 for non-existent user', async () => {
    const req = mockRequest({ login: 'nouser', password: 'password' });
    const res = mockResponse();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401); // Or 404 depending on desired behavior
  });
});
