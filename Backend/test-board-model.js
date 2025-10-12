import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Server from './src/models/serverModel.js';
import Channel from './src/models/channelModel.js';
import Board from './src/models/boardModel.js';
import User from './src/models/userModel.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/collabie-test', {
});

const testBoardModel = async () => {
  try {
    // Clean up any existing test data first
    await User.deleteMany({ username: { $regex: /^testuser/ } });
    await Server.deleteMany({ name: 'Test Server' });
    await Channel.deleteMany({ name: { $regex: /^Test Channel/ } });
    await Board.deleteMany({});
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
    
    // Create a board channel
    const boardChannel = new Channel({
      name: 'Test Board Channel',
      type: 'board',
      serverId: server._id
    });
    
    await boardChannel.save();
    console.log('Created board channel:', boardChannel.name);
    
    // Create a board for the channel
    const board = new Board({
      channelId: boardChannel._id
    });
    
    await board.save();
    console.log('Created board for channel');
    
    // Create a list in the board
    await board.createList('To Do');
    console.log('Created list: To Do');
    
    // Add a task to the list
    const listId = board.lists[0]._id;
    await board.addTask(listId, { title: 'Test Task' });
    console.log('Added task to list');
    
    // Update the task
    const taskId = board.lists[0].tasks[0]._id;
    await board.updateTask(listId, taskId, { 
      description: 'This is a test task',
      dueDate: new Date()
    });
    console.log('Updated task with description and due date');
    
    // Create another list
    await board.createList('In Progress');
    console.log('Created list: In Progress');
    
    // Move task to the new list
    const newListId = board.lists[1]._id;
    await board.moveTask(listId, taskId, newListId);
    console.log('Moved task to new list');
    
    // Fetch the updated board
    const updatedBoard = await Board.findById(board._id);
    console.log('Board lists:');
    updatedBoard.lists.forEach(list => {
      console.log(`- ${list.title} (${list.tasks.length} tasks)`);
      list.tasks.forEach(task => {
        console.log(`  - ${task.title}`);
      });
    });
    
    console.log('All board tests passed!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Clean up
    await User.deleteMany({ username: { $regex: /^testuser/ } });
    await Server.deleteMany({ name: 'Test Server' });
    await Channel.deleteMany({ name: { $regex: /^Test Channel/ } });
    await Board.deleteMany({});
    console.log('Cleaned up test data');
    mongoose.connection.close();
  }
};

testBoardModel();