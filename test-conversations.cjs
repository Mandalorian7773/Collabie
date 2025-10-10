const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/collabie')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Simple test to check if we can query the friends collection
async function testFriends() {
  try {
    // Import models after connection
    const Friend = require('./Backend/src/models/friendModel.js');
    const User = require('./Backend/src/models/userModel.js');
    const Message = require('./Backend/src/models/messageModel.js');
    
    const currentUserId = '68e9298796bada07f39d2169'; // user1 ID
    console.log('Current user ID:', currentUserId);
    
    // Test Friend.getFriends
    console.log('Testing Friend.getFriends...');
    const friends = await Friend.getFriends(currentUserId);
    console.log('Friends found:', friends.length);
    console.log('Friends:', JSON.stringify(friends, null, 2));
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testFriends();