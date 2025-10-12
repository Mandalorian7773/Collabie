import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Server from './src/models/serverModel.js';
import Channel from './src/models/channelModel.js';
import User from './src/models/userModel.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/collabie-test', {
});

const testChannelModel = async () => {
  try {
    // Clean up any existing test data first
    await User.deleteMany({ username: { $regex: /^testuser/ } });
    await Server.deleteMany({ name: 'Test Server' });
    await Channel.deleteMany({ name: { $regex: /^Test Channel/ } });
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
    
    // Create channels
    const textChannel = new Channel({
      name: 'Test Text Channel',
      type: 'text',
      serverId: server._id
    });
    
    await textChannel.save();
    console.log('Created text channel:', textChannel.name);
    
    const boardChannel = new Channel({
      name: 'Test Board Channel',
      type: 'board',
      serverId: server._id
    });
    
    await boardChannel.save();
    console.log('Created board channel:', boardChannel.name);
    
    const voiceChannel = new Channel({
      name: 'Test Voice Channel',
      type: 'voice',
      serverId: server._id
    });
    
    await voiceChannel.save();
    console.log('Created voice channel:', voiceChannel.name);
    
    // Fetch channels by server
    const channels = await Channel.findByServerId(server._id);
    console.log('Channels for server:');
    channels.forEach(channel => {
      console.log(`- ${channel.name} (${channel.type})`);
    });
    
    console.log('All channel tests passed!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Clean up
    await User.deleteMany({ username: { $regex: /^testuser/ } });
    await Server.deleteMany({ name: 'Test Server' });
    await Channel.deleteMany({ name: { $regex: /^Test Channel/ } });
    console.log('Cleaned up test data');
    mongoose.connection.close();
  }
};

testChannelModel();