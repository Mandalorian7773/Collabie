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
    const Friend = require('./src/models/friendModel.js');
    
    // Try different ways to access the model
    console.log('Friend:', Friend);
    console.log('Friend.default:', Friend.default);
    
    // Use the correct reference
    const FriendModel = Friend.default || Friend;
    
    console.log('FriendModel keys:', Object.keys(FriendModel));
    console.log('FriendModel static methods:', Object.keys(FriendModel.statics || {}));
    
    // Check if getFriends exists
    console.log('getFriends function exists:', typeof FriendModel.getFriends);
    
    const currentUserId = '68e9298796bada07f39d2169'; // user1 ID
    console.log('Current user ID:', currentUserId);
    
    // Test Friend.getFriends
    console.log('Testing Friend.getFriends...');
    if (typeof FriendModel.getFriends === 'function') {
      const friends = await FriendModel.getFriends(currentUserId);
      console.log('Friends found:', friends.length);
    } else {
      console.log('getFriends is not a function');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testFriends();