import { gql } from 'graphql-tag';

const serverSchema = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    avatar: String
    role: String!
    isActive: Boolean!
    lastActive: String
  }

  type ServerMember {
    userId: User!
    role: String!
  }

  type Server {
    id: ID!
    name: String!
    owner: User!
    members: [ServerMember!]!
    channels: [Channel!]!
    inviteCode: String!
    createdAt: String!
    updatedAt: String!
  }

  type Channel {
    id: ID!
    name: String!
    type: String!
    serverId: ID!
    createdAt: String!
    updatedAt: String!
  }

  type List {
    id: ID!
    title: String!
    tasks: [Task!]!
    createdAt: String!
    updatedAt: String!
  }

  type Task {
    id: ID!
    title: String!
    description: String
    assignedTo: User
    dueDate: String
    comments: [Comment!]!
    createdAt: String!
    updatedAt: String!
  }

  type Comment {
    user: User!
    text: String!
    createdAt: String!
  }

  type Board {
    id: ID!
    channelId: ID!
    lists: [List!]!
    createdAt: String!
    updatedAt: String!
  }

  input TaskInput {
    title: String
    description: String
    assignedTo: ID
    dueDate: String
  }

  type Query {
    # Server Queries
    getUserServers: [Server!]!
    getServerById(serverId: ID!): Server
    getServerByInviteCode(inviteCode: String!): Server
    
    # Channel Queries
    getChannelsByServer(serverId: ID!): [Channel!]!
    
    # Board Queries
    getBoardByChannel(channelId: ID!): Board
  }

  type Mutation {
    # Server Mutations
    createServer(name: String!): Server!
    generateInviteCode(serverId: ID!): String!
    joinServer(inviteCode: String!): Server!
    updateMemberRole(serverId: ID!, userId: ID!, role: String!): Boolean!
    sendServerInvite(serverId: ID!, email: String!): Boolean!
    leaveServer(serverId: ID!): Boolean!
    
    # Channel Mutations
    createChannel(serverId: ID!, name: String!, type: String!): Channel!
    deleteChannel(channelId: ID!): Boolean!
    
    # Board Mutations
    createBoard(channelId: ID!): Board!
    createList(boardId: ID!, title: String!): List!
    addTask(listId: ID!, title: String!): Task!
    updateTask(taskId: ID!, updates: TaskInput!): Task!
    moveTask(taskId: ID!, toListId: ID!): Boolean!
  }

  type Subscription {
    # Board Subscriptions
    taskAdded: Task!
    taskUpdated: Task!
    taskMoved: Task!
  }
`;

export default serverSchema;