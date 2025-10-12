# Collabie Manual Testing Guide

This guide provides instructions for manually testing all features of the Collabie application.

## Prerequisites

1. Ensure both frontend and backend servers are running:
   - Backend: `http://localhost:3001`
   - Frontend: `http://localhost:5175`

2. MongoDB database should be accessible

## Testing Steps

### 1. User Authentication Flow

1. Open `http://localhost:5175` in your browser
2. Click "Sign Up" and create a new account
3. Verify email validation works (try invalid email)
4. Verify password requirements (must contain uppercase, lowercase, and number)
5. After registration, verify automatic login
6. Log out and log back in using credentials
7. Test "Forgot Password" flow (if implemented)

### 2. Friend System

1. Register two user accounts (User A and User B)
2. Log in as User A
3. Navigate to "Add Friend" or similar feature
4. Send a friend request to User B by username
5. Log in as User B
6. Check notifications or friend requests section
7. Accept the friend request from User A
8. Verify both users appear in each other's friend lists
9. Test declining a friend request (send another request and decline it)

### 3. Messaging System

1. Ensure two users are friends (from previous test)
2. Log in as User A
3. Navigate to the messaging interface
4. Select User B from the friends list
5. Send a text message
6. Log in as User B in another browser/incognito window
7. Verify the message appears in real-time
8. Send a reply message from User B
9. Verify User A receives the reply in real-time
10. Test message history persistence

### 4. Server and Channel System (GraphQL)

#### Using GraphQL Playground:
1. Open `http://localhost:3001/graphql` in your browser
2. Create a new user account if you don't have one
3. Obtain a JWT token by logging in through the REST API
4. Add the token to HTTP headers in GraphQL Playground:
   ```json
   {
     "Authorization": "Bearer YOUR_JWT_TOKEN_HERE"
   }
   ```

#### Test Server Creation:
1. Execute the following mutation:
   ```graphql
   mutation {
     createServer(name: "Test Server") {
       id
       name
       inviteCode
     }
   }
   ```

2. Verify the server is created with a unique invite code

#### Test Channel Creation:
1. Create different types of channels:
   ```graphql
   mutation {
     createChannel(serverId: "SERVER_ID", name: "General", type: "text") {
       id
       name
       type
     }
   }
   ```

2. Test creating "board" and "voice" channels as well

#### Test Server Membership:
1. Use the invite code to join the server as another user
2. Verify the user appears in the server member list

### 5. Board System

#### Create a Board:
1. Create a server with a "board" type channel
2. Create a board for that channel:
   ```graphql
   mutation {
     createBoard(channelId: "CHANNEL_ID") {
       id
       channelId {
         id
         name
       }
     }
   }
   ```

#### Create Lists and Tasks:
1. Create a list in the board:
   ```graphql
   mutation {
     createList(boardId: "BOARD_ID", title: "To Do") {
       id
       title
     }
   }
   ```

2. Add a task to the list:
   ```graphql
   mutation {
     addTask(listId: "LIST_ID", title: "Test Task") {
       id
       title
     }
   }
   ```

#### Test Real-time Collaboration:
1. Open the GraphQL Playground in two browser windows
2. Subscribe to task updates in one window:
   ```graphql
   subscription {
     taskUpdated {
       id
       title
       description
     }
   }
   ```

3. Update a task in the other window:
   ```graphql
   mutation {
     updateTask(
       taskId: "TASK_ID", 
       updates: { 
         description: "Updated description" 
       }
     ) {
       id
       title
       description
     }
   }
   ```

4. Verify the subscription receives the update in real-time

### 6. Voice/Video Calling

1. Ensure two users are friends
2. Log in as both users in different browsers
3. Initiate a voice call from one user to another
4. Verify the call request is received
5. Accept the call and verify audio connection
6. Test muting/unmuting audio
7. End the call and verify proper cleanup
8. Repeat for video calling if implemented

### 7. Real-time Features

1. Test online presence indicators:
   - Log in with multiple users
   - Verify online status shows correctly
   - Log out one user and verify status updates

2. Test real-time messaging:
   - Open chat between two users
   - Send messages from both sides
   - Verify instant delivery

3. Test real-time board updates:
   - Collaborate on a board with multiple users
   - Add/move tasks and verify real-time updates

### 8. Role-based Permissions

1. Create a server as User A (owner)
2. Invite User B to the server
3. Verify User B has "member" role by default
4. As owner, change User B's role to "admin"
5. Verify User B can now create channels
6. Test that "member" users cannot create channels
7. Verify that only owners can delete the server

### 9. Frontend UI Integration

1. Navigate through all pages and components
2. Test responsive design on different screen sizes
3. Verify all forms have proper validation
4. Test error handling and user feedback
5. Verify loading states for async operations
6. Test accessibility features

## Testing Tools

### GraphQL Playground
- URL: `http://localhost:3001/graphql`
- Use for testing all GraphQL queries, mutations, and subscriptions

### MongoDB Compass/Studio 3T
- Connect to your MongoDB instance
- Verify data is stored correctly
- Check relationships between documents

### Browser Developer Tools
- Network tab to monitor API requests
- Console for JavaScript errors
- Application tab for localStorage/cookies

## Common Test Scenarios

### Error Handling
1. Test invalid credentials during login
2. Test duplicate username/email during registration
3. Test expired JWT tokens
4. Test unauthorized access to protected resources
5. Test network errors and retry mechanisms

### Edge Cases
1. Test with special characters in usernames
2. Test with very long messages
3. Test with multiple simultaneous connections
4. Test with slow network conditions
5. Test with browser refresh during operations

### Performance
1. Test with many friends (100+)
2. Test with long message histories
3. Test with many servers and channels
4. Test with multiple board lists and tasks

## Expected Results

All tests should pass with:
- ✅ No errors in browser console
- ✅ Proper HTTP status codes
- ✅ Correct data persistence
- ✅ Real-time updates working
- ✅ Proper error messages for invalid operations
- ✅ Smooth user experience

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS is configured for localhost
2. **Authentication Failures**: Verify JWT token is properly included in requests
3. **Real-time Updates Not Working**: Check Socket.IO connection
4. **GraphQL Errors**: Verify schema and resolvers are correctly implemented
5. **Database Connection Issues**: Check MongoDB connection string

### Debugging Steps

1. Check server logs for error messages
2. Verify environment variables are set correctly
3. Ensure all required services are running
4. Check browser developer tools for network errors
5. Validate API responses match expected format

## Conclusion

This manual testing guide covers all major features of the Collabie application. Following these steps will help ensure that all systems are working correctly together and provide a solid foundation for user acceptance testing.