import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Server from './src/models/serverModel.js';
import User from './src/models/userModel.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/collabie-test', {
});

const testServerModel = async () => {
  try {
    // Clean up any existing test data first
    await User.deleteMany({ username: { $regex: /^testuser/ } });
    await User.deleteMany({ username: { $regex: /^memberuser/ } });
    await Server.deleteMany({ name: 'Test Server' });
    console.log('Cleaned up existing test data');
    
    // Create a test user
    const user = new User({
      username: 'testuser' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      password: 'password123'
    });
    
    await user.save();
    console.log('Created test user:', user.username);
    
    // Create a server
    const server = new Server({
      name: 'Test Server',
      owner: user._id
    });
    
    await server.save();
    console.log('Created server:', server.name);
    console.log('Invite code:', server.inviteCode);
    
    // Add another member
    const member = new User({
      username: 'memberuser' + Date.now(),
      email: 'member' + Date.now() + '@example.com',
      password: 'password123'
    });
    
    await member.save();
    console.log('Created member user:', member.username);
    
    // Re-fetch server to get the latest version
    let updatedServer = await Server.findById(server._id);
    await updatedServer.addMember(member._id, 'member');
    console.log('Added member to server');
    
    // Fetch server with populated data
    const populatedServer = await Server.findById(server._id)
      .populate('owner', 'username email')
      .populate('members.userId', 'username email');
    
    console.log('Server with members:', populatedServer.name);
    console.log('Members count:', populatedServer.members.length);
    
    // Test invite code generation
    const oldInviteCode = populatedServer.inviteCode;
    await populatedServer.generateInviteCode();
    console.log('Old invite code:', oldInviteCode);
    console.log('New invite code:', populatedServer.inviteCode);
    
    // Test role update - re-fetch server first
    updatedServer = await Server.findById(server._id);
    await updatedServer.updateMemberRole(member._id, 'admin');
    console.log('Updated member role to admin');
    
    // Fetch updated server
    const finalServer = await Server.findById(server._id)
      .populate('owner', 'username email')
      .populate('members.userId', 'username email');
    
    console.log('Updated server members:');
    finalServer.members.forEach(member => {
      console.log(`- ${member.userId.username} (${member.role})`);
    });
    
    console.log('All tests passed!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Clean up
    await User.deleteMany({ username: { $regex: /^testuser/ } });
    await User.deleteMany({ username: { $regex: /^memberuser/ } });
    await Server.deleteMany({ name: 'Test Server' });
    console.log('Cleaned up test data');
    mongoose.connection.close();
  }
};

testServerModel();