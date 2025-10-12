import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const testFriendSystem = async () => {
  try {
    // Register two users
    const user1 = {
      username: `user1_${Date.now()}`,
      email: `user1${Date.now()}@example.com`,
      password: 'Password123!'
    };
    
    const user2 = {
      username: `user2_${Date.now()}`,
      email: `user2${Date.now()}@example.com`,
      password: 'Password123!'
    };
    
    // Register users
    const registerResponse1 = await axios.post(`${API_BASE_URL}/auth/register`, user1);
    console.log('User 1 registered:', registerResponse1.data.user.username);
    
    const registerResponse2 = await axios.post(`${API_BASE_URL}/auth/register`, user2);
    console.log('User 2 registered:', registerResponse2.data.user.username);
    
    // Login as user 1
    const loginResponse1 = await axios.post(`${API_BASE_URL}/auth/login`, {
      identifier: user1.email,
      password: user1.password
    });
    
    const token1 = loginResponse1.data.tokens.accessToken;
    console.log('User 1 logged in');
    
    // Login as user 2
    const loginResponse2 = await axios.post(`${API_BASE_URL}/auth/login`, {
      identifier: user2.email,
      password: user2.password
    });
    
    const token2 = loginResponse2.data.tokens.accessToken;
    console.log('User 2 logged in');
    
    // User 1 sends friend request to user 2
    const friendRequestResponse = await axios.post(`${API_BASE_URL}/friends/request`, 
      { recipientUsername: user2.username },
      { headers: { Authorization: `Bearer ${token1}` } }
    );
    
    console.log('Friend request sent:', friendRequestResponse.data.message);
    
    // User 2 gets pending requests
    const pendingRequestsResponse = await axios.get(`${API_BASE_URL}/friends/pending`, 
      { headers: { Authorization: `Bearer ${token2}` } }
    );
    
    console.log('Pending requests retrieved:', pendingRequestsResponse.data.count);
    
    // User 2 accepts the friend request
    const requestId = pendingRequestsResponse.data.pendingRequests[0]._id;
    const acceptResponse = await axios.post(`${API_BASE_URL}/friends/accept/${requestId}`, 
      {}, 
      { headers: { Authorization: `Bearer ${token2}` } }
    );
    
    console.log('Friend request accepted:', acceptResponse.data.message);
    
    // Both users get their friends list
    const friendsResponse1 = await axios.get(`${API_BASE_URL}/friends`, 
      { headers: { Authorization: `Bearer ${token1}` } }
    );
    
    console.log('User 1 friends count:', friendsResponse1.data.count);
    
    const friendsResponse2 = await axios.get(`${API_BASE_URL}/friends`, 
      { headers: { Authorization: `Bearer ${token2}` } }
    );
    
    console.log('User 2 friends count:', friendsResponse2.data.count);
    
    console.log('All friend system tests passed!');
  } catch (error) {
    console.error('Error during testing:', error.response?.data || error.message);
  }
};

testFriendSystem();