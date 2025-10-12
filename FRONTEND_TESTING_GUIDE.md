# Collabie Frontend Testing Guide

This guide provides instructions for testing all frontend features of the Collabie application.

## Prerequisites

1. Ensure both frontend and backend servers are running:
   - Backend: `http://localhost:3001`
   - Frontend: `http://localhost:5175`

2. MongoDB database should be accessible

3. User accounts for testing (at least 2 users recommended)

## Testing Environment Setup

### 1. Start Backend Server
```bash
cd /Users/adityajagrani/Desktop/Collabie/Backend
npm run dev
```

### 2. Start Frontend Server
```bash
cd /Users/adityajagrani/Desktop/Collabie/Frontend
npm run dev
```

### 3. Verify Servers are Running
- Backend: http://localhost:3001/api/health (should return healthy status)
- Frontend: http://localhost:5175 (should show login page)

## Testing Steps

### 1. Authentication Flow

#### Registration
1. Open `http://localhost:5175` in your browser
2. Click "Sign Up" link
3. Fill in registration form:
   - Username: `testuser1`
   - Email: `testuser1@example.com`
   - Password: `Password123!` (must contain uppercase, lowercase, and number)
4. Submit form
5. Verify automatic redirect to dashboard

#### Login
1. Log out or open new browser window
2. Navigate to `http://localhost:5175/login`
3. Enter credentials:
   - Email/Username: `testuser1@example.com` or `testuser1`
   - Password: `Password123!`
4. Submit form
5. Verify redirect to dashboard

#### Validation Testing
1. Try registering with invalid email (should show error)
2. Try registering with weak password (should show error)
3. Try logging in with wrong credentials (should show error)

### 2. Friend System

#### Add Friend
1. Log in as `testuser1`
2. Navigate to Dashboard
3. In "Add User" section, enter username of another test user
4. Click "Add User"
5. Verify success message

#### Accept Friend Request
1. Log in as the user who received the friend request
2. Navigate to Dashboard
3. In "Pending Requests" section, verify request is visible
4. Click "Accept" button
5. Verify request disappears and user appears in friends list

#### View Friends
1. Log in as either user
2. Navigate to Dashboard
3. Scroll to conversations section
4. Verify friend appears in list

### 3. Messaging System

#### Send Message
1. Log in as one friend
2. Navigate to Dashboard
3. Click on friend in conversations list
4. Enter message in text box
5. Click "Send" or press Enter
6. Verify message appears in chat

#### Receive Message
1. Log in as the other friend in a different browser/window
2. Navigate to Dashboard
3. Click on the first user in conversations list
4. Verify message appears in real-time

#### Online Status
1. Have both users online in different browsers
2. Verify green dot indicator next to online users
3. Close one browser and verify status changes to offline

### 4. Server & Channel System

#### Create Server
1. Log in as any user
2. Navigate to Dashboard
3. Click "Go to Servers" button
4. Click "Create Server" button
5. Enter server name: `Test Server`
6. Click "Create Server"
7. Verify redirected to server page

#### Join Server
1. Log in as different user
2. Navigate to `/servers` route
3. Click "Join Server" button
4. Obtain invite code from server owner (check server settings)
5. Enter invite code and click "Validate"
6. Click "Join Server"
7. Verify redirected to server page

#### Create Channels
1. Log in as server owner or admin
2. Navigate to server page
3. Click "Create Channel" button at bottom of sidebar
4. Enter channel name: `general`
5. Select channel type: `Text Channel`
6. Click "Create Channel"
7. Verify channel appears in sidebar

8. Repeat steps 3-7 to create:
   - Board channel: `project-board` (type: Board Channel)
   - Voice channel: `voice-chat` (type: Voice Channel)

#### View Channels
1. Click on each channel type in sidebar
2. Verify appropriate content area is displayed:
   - Text channels: Chat interface
   - Board channels: Board interface
   - Voice channels: Voice call interface

### 5. Board System

#### Create Board
1. Navigate to server with board channel
2. Click on board channel in sidebar
3. If board doesn't exist, click "Create Board"
4. Verify board interface is displayed

#### Create Lists
1. In board view, click "Add another list" button
2. Enter list name: `To Do`
3. Click "Add List"
4. Verify list column appears

5. Repeat for additional lists:
   - `In Progress`
   - `Done`

#### Add Tasks
1. In "To Do" list, click "+ Add a task" button
2. Enter task title: `Create documentation`
3. Click "Add Task"
4. Verify task card appears in list

5. Add additional tasks:
   - `Implement feature`
   - `Write tests`

#### Move Tasks
1. Drag task card from "To Do" list
2. Drop on "In Progress" list
3. Verify task moves to new list

#### View Task Details
1. Click on any task card
2. Verify task details modal appears
3. Close modal by clicking "Close" or "✕"

### 6. Navigation

#### Main Navigation
1. Click "🏠" icon in left sidebar
2. Verify redirected to Dashboard

2. Click "🏢" icon in left sidebar
3. Verify redirected to Servers

#### Server Navigation
1. In Servers page, click on any server
2. Verify redirected to server page

2. In server page, click on different channels
3. Verify content area updates

### 7. Responsive Design

#### Desktop
1. View application in desktop browser
2. Verify full sidebar navigation
3. Verify all components properly sized

#### Mobile/Tablet
1. Open browser developer tools
2. Toggle device toolbar
3. Select mobile device (e.g., iPhone)
4. Verify:
   - Navigation adapts to mobile
   - Content reflows appropriately
   - Touch targets are appropriately sized

### 8. Error Handling

#### Network Errors
1. Stop backend server
2. Try any API operation
3. Verify error message is displayed
4. Restart backend server
5. Try operation again
6. Verify it works

#### Validation Errors
1. Try creating server with empty name
2. Verify validation error message
3. Try creating channel with empty name
4. Verify validation error message

#### Authentication Errors
1. Try accessing protected route without login
2. Verify redirected to login page
3. Try using expired token
4. Verify redirected to login page

## Automated Testing

### Component Import Testing
```bash
cd /Users/adityajagrani/Desktop/Collabie/Frontend
node test-components.js
```
This verifies all components can be imported without syntax errors.

### Service Integration Testing
The GraphQL service layer is ready for integration testing with a running backend.

## Manual Testing Checklist

### Authentication
- [ ] User registration
- [ ] User login
- [ ] Password validation
- [ ] Email validation
- [ ] Token persistence
- [ ] Logout functionality

### Friend System
- [ ] Send friend request
- [ ] Accept friend request
- [ ] Decline friend request
- [ ] View friends list
- [ ] View pending requests
- [ ] Remove friend

### Messaging System
- [ ] Send message
- [ ] Receive message (real-time)
- [ ] Message history
- [ ] Online status indicators
- [ ] Typing indicators
- [ ] Message read status

### Server System
- [ ] Create server
- [ ] Join server
- [ ] View server list
- [ ] Server member management
- [ ] Role-based permissions

### Channel System
- [ ] Create text channel
- [ ] Create board channel
- [ ] Create voice channel
- [ ] View channels by type
- [ ] Channel permissions

### Board System
- [ ] Create board
- [ ] Create lists
- [ ] Add tasks
- [ ] Move tasks
- [ ] View task details
- [ ] Drag-and-drop functionality

### Navigation
- [ ] Main navigation
- [ ] Server navigation
- [ ] Channel navigation
- [ ] Route protection

### Responsive Design
- [ ] Desktop layout
- [ ] Tablet layout
- [ ] Mobile layout
- [ ] Touch interactions

### Error Handling
- [ ] Network errors
- [ ] Validation errors
- [ ] Authentication errors
- [ ] API errors

### Performance
- [ ] Page load times
- [ ] Component rendering
- [ ] API response times
- [ ] Memory usage

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify backend CORS configuration
   - Check frontend API_BASE_URL in env.js
   - Ensure both servers are running

2. **Authentication Failures**
   - Verify JWT token is properly stored
   - Check browser localStorage
   - Verify backend authentication endpoints

3. **Real-time Updates Not Working**
   - Verify Socket.IO connection
   - Check browser developer console for errors
   - Ensure WebSocket endpoint is correct

4. **GraphQL Errors**
   - Verify GraphQL endpoint is accessible
   - Check browser developer tools Network tab
   - Verify authentication headers are sent

### Debugging Steps

1. Check browser developer console for JavaScript errors
2. Check Network tab for failed API requests
3. Verify environment variables are set correctly
4. Ensure all required services are running
5. Check browser localStorage for token storage
6. Verify component props and state in React DevTools

## Performance Testing

### Load Testing
1. Open multiple browser tabs with different users
2. Simultaneously send messages
3. Verify real-time delivery
4. Check for performance degradation

### Memory Testing
1. Monitor browser memory usage
2. Navigate between pages frequently
3. Verify no memory leaks
4. Check for proper component unmounting

## Security Testing

### Authentication Testing
1. Try accessing protected routes without login
2. Try using expired tokens
3. Try tampering with JWT tokens
4. Verify proper error handling

### Authorization Testing
1. Try creating channels as non-admin user
2. Try deleting channels as non-owner
3. Verify role-based access control
4. Check for proper permission enforcement

## Conclusion

This testing guide covers all major features of the Collabie frontend application. Following these steps will help ensure that all systems are working correctly together and provide a solid foundation for user acceptance testing.

The frontend implementation is complete with all requested features:
- Authentication system
- Friend system
- Messaging system
- Server and channel system
- Trello-style board system
- Real-time features
- Responsive design
- Error handling
- Security measures