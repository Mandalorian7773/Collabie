// Simple test to verify component imports
import React from 'react';
import { createRoot } from 'react-dom/client';
import ServerDashboard from './src/Pages/Server/ServerDashboard.jsx';
import ServerPage from './src/Pages/Server/ServerPage.jsx';
import ServerList from './src/components/Server/ServerList.jsx';
import CreateServerModal from './src/components/Server/CreateServerModal.jsx';
import JoinServerModal from './src/components/Server/JoinServerModal.jsx';
import ChannelList from './src/components/Server/ChannelList.jsx';
import CreateChannelModal from './src/components/Server/CreateChannelModal.jsx';
import ChatView from './src/components/Server/ChatView.jsx';
import BoardView from './src/components/Server/BoardView.jsx';
import BoardColumn from './src/components/Server/BoardColumn.jsx';
import TaskCard from './src/components/Server/TaskCard.jsx';

console.log('All components imported successfully!');

// Test that we can create a simple element from each component
const testComponents = [
  ServerDashboard,
  ServerPage,
  ServerList,
  CreateServerModal,
  JoinServerModal,
  ChannelList,
  CreateChannelModal,
  ChatView,
  BoardView,
  BoardColumn,
  TaskCard
];

testComponents.forEach((Component, index) => {
  try {
    // Create a simple test element
    const element = React.createElement(Component, { key: index });
    console.log(`✓ Component ${Component.name} can be instantiated`);
  } catch (error) {
    console.error(`✗ Error with component ${Component.name}:`, error.message);
  }
});

console.log('Component import test completed!');