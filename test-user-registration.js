import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const testUserRegistration = async () => {
  try {
    const username = `testuser_${Date.now()}`;
    const email = `test${Date.now()}@example.com`;
    const password = 'Password123!';
    
    // Register a new user
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      username,
      email,
      password
    });
    
    console.log('Registration successful:', registerResponse.data);
    
    // Login with the new user using email as identifier
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      identifier: email,
      password
    });
    
    console.log('Login successful with email:', loginResponse.data);
    
    // Try login with username as identifier
    const loginResponse2 = await axios.post(`${API_BASE_URL}/auth/login`, {
      identifier: username,
      password
    });
    
    console.log('Login successful with username:', loginResponse2.data);
    
    // Get user profile
    const profileResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${loginResponse.data.tokens.accessToken}`
      }
    });
    
    console.log('Profile retrieved:', profileResponse.data);
    
    console.log('All authentication tests passed!');
  } catch (error) {
    console.error('Error during testing:', error.response?.data || error.message);
  }
};

testUserRegistration();