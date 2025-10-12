# Discord-Style Server & Channel System

This document explains the implementation of the Discord-style server and channel system with Trello-style boards.

## Models

### Server Model
Represents a server (similar to a Discord server or Slack workspace).

**Fields:**
- `name`: String - Server name
- `owner`: ObjectId (ref: User) - Server owner
- `members`: Array of { userId, role } - Server members with roles
- `channels`: Array of ObjectId (ref: Channel) - Server channels
- `inviteCode`: String (unique) - Code for joining the server

**Roles:**
- `owner`: Full permissions, cannot be changed
- `admin`: Can manage channels and members
- `member`: Standard member permissions

### Channel Model
Represents a channel within a server.

**Fields:**
- `name`: String - Channel name
- `type`: String (enum: 'text', 'board', 'voice') - Channel type
- `serverId`: ObjectId (ref: Server) - Parent server
- `messages`: Array of ObjectId (ref: Message) - Messages (for text channels)

### Board Model
Represents a Trello-style board linked to a board channel.

**Fields:**
- `channelId`: ObjectId (ref: Channel) - Parent channel
- `lists`: Array of List objects - Board lists (columns)

**List Object:**
- `title`: String - List title
- `tasks`: Array of Task objects - List tasks

**Task Object:**
- `title`: String - Task title
- `description`: String - Task description
- `assignedTo`: ObjectId (ref: User) - Assigned user
- `dueDate`: Date - Due date
- `comments`: Array of Comment objects - Task comments

## GraphQL API

### Queries

#### Server Queries
- `getUserServers: [Server!]!` - Get all servers for the current user
- `getServerById(serverId: ID!): Server` - Get a server by ID
- `getServerByInviteCode(inviteCode: String!): Server` - Get a server by invite code

#### Channel Queries
- `getChannelsByServer(serverId: ID!): [Channel!]!` - Get all channels for a server

#### Board Queries
- `getBoardByChannel(channelId: ID!): Board` - Get a board by channel ID

### Mutations

#### Server Mutations
- `createServer(name: String!): Server!` - Create a new server
- `generateInviteCode(serverId: ID!): String!` - Generate a new invite code
- `joinServer(inviteCode: String!): Server!` - Join a server with an invite code
- `updateMemberRole(serverId: ID!, userId: ID!, role: String!): Boolean!` - Update a member's role
- `sendServerInvite(serverId: ID!, email: String!): Boolean!` - Send server invite to email
- `leaveServer(serverId: ID!): Boolean!` - Leave a server

#### Channel Mutations
- `createChannel(serverId: ID!, name: String!, type: String!): Channel!` - Create a new channel
- `deleteChannel(channelId: ID!): Boolean!` - Delete a channel

#### Board Mutations
- `createBoard(channelId: ID!): Board!` - Create a board for a channel
- `createList(boardId: ID!, title: String!): List!` - Create a list in a board
- `addTask(listId: ID!, title: String!): Task!` - Add a task to a list
- `updateTask(taskId: ID!, updates: TaskInput!): Task!` - Update a task
- `moveTask(taskId: ID!, toListId: ID!): Boolean!` - Move a task to another list

### Subscriptions

#### Board Subscriptions
- `taskAdded: Task!` - Subscribe to task additions
- `taskUpdated: Task!` - Subscribe to task updates
- `taskMoved: Task!` - Subscribe to task moves

## Implementation Details

### Authentication
All mutations and queries require authentication. The user context is passed through the GraphQL context.

### Authorization
- Only server owners and admins can create/delete channels
- Only server owners and admins can update member roles
- Only server owners can delete servers
- Only members can view server content

### Real-time Updates
Board updates are broadcast using GraphQL subscriptions with PubSub.

## Usage Examples

### Creating a Server
```graphql
mutation {
  createServer(name: "My Team Server") {
    id
    name
    inviteCode
  }
}
```

### Creating a Channel
```graphql
mutation {
  createChannel(
    serverId: "server-id"
    name: "general"
    type: "text"
  ) {
    id
    name
    type
  }
}
```

### Creating a Board
```graphql
mutation {
  createBoard(channelId: "board-channel-id") {
    id
    channelId {
      id
      name
    }
  }
}
```

### Adding a List to a Board
```graphql
mutation {
  createList(
    boardId: "board-id"
    title: "To Do"
  ) {
    id
    title
  }
}
```

### Adding a Task to a List
```graphql
mutation {
  addTask(
    listId: "list-id"
    title: "Implement feature"
  ) {
    id
    title
    description
  }
}
```

### Moving a Task
```graphql
mutation {
  moveTask(
    taskId: "task-id"
    toListId: "new-list-id"
  )
}
```

### Subscribing to Task Updates
```graphql
subscription {
  taskUpdated {
    id
    title
    description
    updatedAt
  }
}
```