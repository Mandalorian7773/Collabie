import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Friend from './src/models/friendModel.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/collabie')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Simple test to check if we can query the friends collection
async function testFriends() {
  try {
    console.log('Friend model:', Friend);
    console.log('Friend static methods:', Object.keys(Friend));
    
    // Check if getFriends exists
    console.log('getFriends function exists:', typeof Friend.getFriends);
    
    const currentUserId = '68e9298796bada07f39d2169'; // user1 ID
    console.log('Current user ID:', currentUserId);
    
    // Test Friend.getFriends
    console.log('Testing Friend.getFriends...');
    if (typeof Friend.getFriends === 'function') {
      const friends = await Friend.getFriends(currentUserId);
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