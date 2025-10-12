import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';
const GRAPHQL_URL = 'http://localhost:3001/graphql';

// Add a delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const testServerSystem = async () => {
  try {
    const timestamp = Date.now();
    
    // Register a user
    const user = {
      username: `serveruser_${timestamp}`,
      email: `serveruser${timestamp}@example.com`,
      password: 'Password123!'
    };
    
    // Register user
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, user);
    console.log('User registered:', registerResponse.data.user.username);
    
    // Wait a bit to avoid rate limiting
    await delay(1000);
    
    // Login as user
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      identifier: user.email,
      password: user.password
    });
    
    const token = loginResponse.data.tokens.accessToken;
    const userId = loginResponse.data.user._id;
    console.log('User logged in');
    
    // Wait a bit to avoid rate limiting
    await delay(1000);
    
    // Test GraphQL query to get user servers (should be empty initially)
    const graphqlHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    const getUserServersQuery = {
      query: `
        query {
          getUserServers {
            id
            name
            inviteCode
          }
        }
      `
    };
    
    const serversResponse = await axios.post(GRAPHQL_URL, getUserServersQuery, {
      headers: graphqlHeaders
    });
    
    console.log('Initial servers count:', serversResponse.data.data.getUserServers.length);
    
    // Wait a bit to avoid rate limiting
    await delay(1000);
    
    // Create a server
    const createServerMutation = {
      query: `
        mutation {
          createServer(name: "Test Server ${timestamp}") {
            id
            name
            inviteCode
          }
        }
      `
    };
    
    const createServerResponse = await axios.post(GRAPHQL_URL, createServerMutation, {
      headers: graphqlHeaders
    });
    
    const serverId = createServerResponse.data.data.createServer.id;
    const inviteCode = createServerResponse.data.data.createServer.inviteCode;
    console.log('Server created:', createServerResponse.data.data.createServer.name);
    console.log('Invite code:', inviteCode);
    
    // Wait a bit to avoid rate limiting
    await delay(1000);
    
    // Get user servers again (should now have 1 server)
    const serversResponse2 = await axios.post(GRAPHQL_URL, getUserServersQuery, {
      headers: graphqlHeaders
    });
    
    console.log('Servers after creation:', serversResponse2.data.data.getUserServers.length);
    
    // Wait a bit to avoid rate limiting
    await delay(1000);
    
    // Create channels in the server
    const createTextChannelMutation = {
      query: `
        mutation {
          createChannel(serverId: "${serverId}", name: "General", type: "text") {
            id
            name
            type
          }
        }
      `
    };
    
    const textChannelResponse = await axios.post(GRAPHQL_URL, createTextChannelMutation, {
      headers: graphqlHeaders
    });
    
    console.log('Text channel created:', textChannelResponse.data.data.createChannel.name);
    
    // Wait a bit to avoid rate limiting
    await delay(1000);
    
    const createBoardChannelMutation = {
      query: `
        mutation {
          createChannel(serverId: "${serverId}", name: "Project Board", type: "board") {
            id
            name
            type
          }
        }
      `
    };
    
    const boardChannelResponse = await axios.post(GRAPHQL_URL, createBoardChannelMutation, {
      headers: graphqlHeaders
    });
    
    console.log('Board channel created:', boardChannelResponse.data.data.createChannel.name);
    
    // Wait a bit to avoid rate limiting
    await delay(1000);
    
    // Get channels for the server
    const getChannelsQuery = {
      query: `
        query {
          getChannelsByServer(serverId: "${serverId}") {
            id
            name
            type
          }
        }
      `
    };
    
    const channelsResponse = await axios.post(GRAPHQL_URL, getChannelsQuery, {
      headers: graphqlHeaders
    });
    
    console.log('Channels retrieved:', channelsResponse.data.data.getChannelsByServer.length);
    channelsResponse.data.data.getChannelsByServer.forEach(channel => {
      console.log(`- ${channel.name} (${channel.type})`);
    });
    
    // Wait a bit to avoid rate limiting
    await delay(1000);
    
    // Create a board for the board channel
    const boardChannelId = boardChannelResponse.data.data.createChannel.id;
    const createBoardMutation = {
      query: `
        mutation {
          createBoard(channelId: "${boardChannelId}") {
            id
            channelId {
              id
              name
            }
          }
        }
      `
    };
    
    const createBoardResponse = await axios.post(GRAPHQL_URL, createBoardMutation, {
      headers: graphqlHeaders
    });
    
    const boardId = createBoardResponse.data.data.createBoard.id;
    console.log('Board created for channel:', createBoardResponse.data.data.createBoard.channelId.name);
    
    // Wait a bit to avoid rate limiting
    await delay(1000);
    
    // Create lists in the board
    const createListMutation = {
      query: `
        mutation {
          createList(boardId: "${boardId}", title: "To Do") {
            id
            title
          }
        }
      `
    };
    
    const createListResponse = await axios.post(GRAPHQL_URL, createListMutation, {
      headers: graphqlHeaders
    });
    
    const listId = createListResponse.data.data.createList.id;
    console.log('List created:', createListResponse.data.data.createList.title);
    
    // Wait a bit to avoid rate limiting
    await delay(1000);
    
    // Add a task to the list
    const addTaskMutation = {
      query: `
        mutation {
          addTask(listId: "${listId}", title: "Test Task") {
            id
            title
          }
        }
      `
    };
    
    const addTaskResponse = await axios.post(GRAPHQL_URL, addTaskMutation, {
      headers: graphqlHeaders
    });
    
    const taskId = addTaskResponse.data.data.addTask.id;
    console.log('Task added:', addTaskResponse.data.data.addTask.title);
    
    console.log('All server system tests passed!');
  } catch (error) {
    console.error('Error during testing:', error.response?.data || error.message);
  }
};

testServerSystem();