import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const testMessagingSystem = async () => {
  try {
    const timestamp = Date.now();
    
    // Register two users
    const user1 = {
      username: `msguser1_${timestamp}`,
      email: `msguser1${timestamp}@example.com`,
      password: 'Password123!'
    };
    
    const user2 = {
      username: `msguser2_${timestamp}`,
      email: `msguser2${timestamp}@example.com`,
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
    
    // User 1 sends a message to user 2
    // In this messaging system, chatId is the recipient's userId and senderId is the sender's userId
    const messageResponse = await axios.post(`${API_BASE_URL}/messages`, 
      { 
        chatId: userId2,  // Recipient's userId
        senderId: userId1, // Sender's userId
        content: 'Hello User 2! This is a test message from the messaging system test.'
      },
      { headers: { Authorization: `Bearer ${token1}` } }
    );
    
    console.log('Message sent:', messageResponse.data.message.content);
    
    // User 2 gets messages from user 1
    const messagesResponse = await axios.get(`${API_BASE_URL}/messages/${userId1}/${userId2}`, 
      { headers: { Authorization: `Bearer ${token2}` } }
    );
    
    console.log('Messages retrieved:', messagesResponse.data.messages.length);
    if (messagesResponse.data.messages.length > 0) {
      console.log('Latest message:', messagesResponse.data.messages[messagesResponse.data.messages.length - 1].content);
    }
    
    console.log('Messaging system test passed!');
  } catch (error) {
    console.error('Error during testing:', error.response?.data || error.message);
  }
};

testMessagingSystem();