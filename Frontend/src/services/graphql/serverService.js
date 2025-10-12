import axios from 'axios';
import config from '../../config/env.js';
import { getAuthToken } from '../authService.js';

const GRAPHQL_ENDPOINT = `${config.API_BASE_URL}/graphql`;

// Helper function to make GraphQL requests
const graphqlRequest = async (query, variables = {}) => {
  try {
    const token = getAuthToken();
    
    const response = await axios.post(
      GRAPHQL_ENDPOINT,
      { query, variables },
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('GraphQL request error:', error);
    throw error;
  }
};

// Server queries
export const getServers = async () => {
  const query = `
    query {
      getUserServers {
        id
        name
        inviteCode
        owner {
          id
          username
        }
        members {
          userId {
            id
            username
          }
          role
        }
        channels {
          id
          name
          type
        }
      }
    }
  `;
  
  return await graphqlRequest(query);
};

export const getServerById = async (serverId) => {
  const query = `
    query GetServer($serverId: ID!) {
      getServerById(serverId: $serverId) {
        id
        name
        inviteCode
        owner {
          id
          username
        }
        members {
          userId {
            id
            username
          }
          role
        }
        channels {
          id
          name
          type
        }
      }
    }
  `;
  
  return await graphqlRequest(query, { serverId });
};

export const getServerByInviteCode = async (inviteCode) => {
  const query = `
    query GetServerByInviteCode($inviteCode: String!) {
      getServerByInviteCode(inviteCode: $inviteCode) {
        id
        name
        inviteCode
        owner {
          id
          username
        }
        members {
          userId {
            id
            username
          }
          role
        }
      }
    }
  `;
  
  return await graphqlRequest(query, { inviteCode });
};

// Server mutations
export const createServer = async (name) => {
  const query = `
    mutation CreateServer($name: String!) {
      createServer(name: $name) {
        id
        name
        inviteCode
        owner {
          id
          username
        }
      }
    }
  `;
  
  return await graphqlRequest(query, { name });
};

export const generateInviteCode = async (serverId) => {
  const query = `
    mutation GenerateInviteCode($serverId: ID!) {
      generateInviteCode(serverId: $serverId)
    }
  `;
  
  return await graphqlRequest(query, { serverId });
};

export const joinServer = async (inviteCode) => {
  const query = `
    mutation JoinServer($inviteCode: String!) {
      joinServer(inviteCode: $inviteCode) {
        id
        name
        inviteCode
        owner {
          id
          username
        }
        members {
          userId {
            id
            username
          }
          role
        }
      }
    }
  `;
  
  return await graphqlRequest(query, { inviteCode });
};

export const updateMemberRole = async (serverId, userId, role) => {
  const query = `
    mutation UpdateMemberRole($serverId: ID!, $userId: ID!, $role: String!) {
      updateMemberRole(serverId: $serverId, userId: $userId, role: $role)
    }
  `;
  
  return await graphqlRequest(query, { serverId, userId, role });
};

export const sendServerInvite = async (serverId, email) => {
  const query = `
    mutation SendServerInvite($serverId: ID!, $email: String!) {
      sendServerInvite(serverId: $serverId, email: $email)
    }
  `;
  
  return await graphqlRequest(query, { serverId, email });
};

export const leaveServer = async (serverId) => {
  const query = `
    mutation LeaveServer($serverId: ID!) {
      leaveServer(serverId: $serverId)
    }
  `;
  
  return await graphqlRequest(query, { serverId });
};

// Channel queries
export const getChannelsByServer = async (serverId) => {
  const query = `
    query GetChannelsByServer($serverId: ID!) {
      getChannelsByServer(serverId: $serverId) {
        id
        name
        type
      }
    }
  `;
  
  return await graphqlRequest(query, { serverId });
};

// Channel mutations
export const createChannel = async (serverId, name, type) => {
  const query = `
    mutation CreateChannel($serverId: ID!, $name: String!, $type: String!) {
      createChannel(serverId: $serverId, name: $name, type: $type) {
        id
        name
        type
      }
    }
  `;
  
  return await graphqlRequest(query, { serverId, name, type });
};

export const deleteChannel = async (channelId) => {
  const query = `
    mutation DeleteChannel($channelId: ID!) {
      deleteChannel(channelId: $channelId)
    }
  `;
  
  return await graphqlRequest(query, { channelId });
};

// Board queries
export const getBoardByChannel = async (channelId) => {
  const query = `
    query GetBoardByChannel($channelId: ID!) {
      getBoardByChannel(channelId: $channelId) {
        id
        channelId {
          id
          name
        }
        lists {
          id
          title
          tasks {
            id
            title
            description
            assignedTo {
              id
              username
            }
            dueDate
            comments {
              user {
                id
                username
              }
              text
              createdAt
            }
            createdAt
            updatedAt
          }
        }
      }
    }
  `;
  
  return await graphqlRequest(query, { channelId });
};

// Board mutations
export const createBoard = async (channelId) => {
  const query = `
    mutation CreateBoard($channelId: ID!) {
      createBoard(channelId: $channelId) {
        id
        channelId {
          id
          name
        }
      }
    }
  `;
  
  return await graphqlRequest(query, { channelId });
};

export const createList = async (boardId, title) => {
  const query = `
    mutation CreateList($boardId: ID!, $title: String!) {
      createList(boardId: $boardId, title: $title) {
        id
        title
      }
    }
  `;
  
  return await graphqlRequest(query, { boardId, title });
};

export const addTask = async (listId, title) => {
  const query = `
    mutation AddTask($listId: ID!, $title: String!) {
      addTask(listId: $listId, title: $title) {
        id
        title
      }
    }
  `;
  
  return await graphqlRequest(query, { listId, title });
};

export const updateTask = async (taskId, updates) => {
  const query = `
    mutation UpdateTask($taskId: ID!, $updates: TaskInput!) {
      updateTask(taskId: $taskId, updates: $updates) {
        id
        title
        description
        assignedTo {
          id
          username
        }
        dueDate
      }
    }
  `;
  
  return await graphqlRequest(query, { taskId, updates });
};

export const moveTask = async (taskId, toListId) => {
  const query = `
    mutation MoveTask($taskId: ID!, $toListId: ID!) {
      moveTask(taskId: $taskId, toListId: $toListId)
    }
  `;
  
  return await graphqlRequest(query, { taskId, toListId });
};

// Subscription helpers (for real-time updates)
export const subscribeToTaskAdded = (callback) => {
  // In a real implementation, you would use GraphQL subscriptions
  // This is a placeholder for now
  console.log('Subscribing to task added');
};

export const subscribeToTaskUpdated = (callback) => {
  // In a real implementation, you would use GraphQL subscriptions
  // This is a placeholder for now
  console.log('Subscribing to task updated');
};

export const subscribeToTaskMoved = (callback) => {
  // In a real implementation, you would use GraphQL subscriptions
  // This is a placeholder for now
  console.log('Subscribing to task moved');
};