import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const testVideoCalling = async () => {
  try {
    const timestamp = Date.now();
    
    // Register two users
    const user1 = {
      username: `videouser1_${timestamp}`,
      email: `videouser1${timestamp}@example.com`,
      password: 'Password123!'
    };
    
    const user2 = {
      username: `videouser2_${timestamp}`,
      email: `videouser2${timestamp}@example.com`,
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
    const userId1 = loginResponse1.data.user._id;
    console.log('User 1 logged in');
    
    // Login as user 2
    const loginResponse2 = await axios.post(`${API_BASE_URL}/auth/login`, {
      identifier: user2.email,
      password: user2.password
    });
    
    const token2 = loginResponse2.data.tokens.accessToken;
    const userId2 = loginResponse2.data.user._id;
    console.log('User 2 logged in');
    
    // User 1 sends friend request to user 2
    const friendRequestResponse = await axios.post(`${API_BASE_URL}/friends/request`, 
      { recipientUsername: user2.username },
      { headers: { Authorization: `Bearer ${token1}` } }
    );
    
    console.log('Friend request sent:', friendRequestResponse.data.message);
    
    // User 2 accepts the friend request
    const pendingRequestsResponse = await axios.get(`${API_BASE_URL}/friends/pending`, 
      { headers: { Authorization: `Bearer ${token2}` } }
    );
    
    const requestId = pendingRequestsResponse.data.pendingRequests[0]._id;
    const acceptResponse = await axios.post(`${API_BASE_URL}/friends/accept/${requestId}`, 
      {}, 
      { headers: { Authorization: `Bearer ${token2}` } }
    );
    
    console.log('Friend request accepted:', acceptResponse.data.message);
    
    // User 1 starts a video call
    const startCallResponse = await axios.post(`${API_BASE_URL}/calls/start`, 
      { 
        roomId: `test-room-${timestamp}`,
        type: 'video'
      },
      { headers: { Authorization: `Bearer ${token1}` } }
    );
    
    const callId = startCallResponse.data.call._id;
    console.log('Video call started:', startCallResponse.data.message);
    
    // User 2 joins the call
    const joinCallResponse = await axios.post(`${API_BASE_URL}/calls/join/${callId}`, 
      {}, 
      { headers: { Authorization: `Bearer ${token2}` } }
    );
    
    console.log('User 2 joined call:', joinCallResponse.data.message);
    
    // User 2 leaves the call
    const leaveCallResponse = await axios.post(`${API_BASE_URL}/calls/leave/${callId}`, 
      {}, 
      { headers: { Authorization: `Bearer ${token2}` } }
    );
    
    console.log('User 2 left call:', leaveCallResponse.data.message);
    
    // User 1 ends the call
    const endCallResponse = await axios.post(`${API_BASE_URL}/calls/end/${callId}`, 
      {}, 
      { headers: { Authorization: `Bearer ${token1}` } }
    );
    
    console.log('Call ended:', endCallResponse.data.message);
    
    console.log('Video calling test passed!');
  } catch (error) {
    console.error('Error during testing:', error.response?.data || error.message);
  }
};

testVideoCalling();