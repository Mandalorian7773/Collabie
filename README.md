# Collabie

Collabie is a modern chat and collaboration platform that combines Discord-style server and channel management with Trello-style project boards.

## Features

### Chat System
- Real-time messaging with Socket.IO
- Friend system with request/accept flow
- Online presence indicators
- Direct messaging

### Server & Channel System (Discord-style)
- Create and manage servers
- Invite users with unique codes
- Role-based permissions (owner, admin, member)
- Multiple channel types:
  - Text channels for chat
  - Voice channels for audio calls
  - Board channels for project management

### Trello-Style Boards
- Kanban-style project boards
- Drag-and-drop task management
- Real-time collaboration with GraphQL subscriptions
- Task assignment and due dates
- Comments and task descriptions

### Authentication & Security
- JWT-based authentication
- Password encryption with bcrypt
- Role-based access control
- CORS protection

## Tech Stack

### Backend
- Node.js with Express 5.x
- MongoDB with Mongoose
- GraphQL with Apollo Server
- Socket.IO for real-time communication
- JWT for authentication

### Frontend
- React with Vite
- TailwindCSS for styling
- Zustand for state management
- react-beautiful-dnd for drag-and-drop

## Getting Started

### Prerequisites
- Node.js 16+
- MongoDB instance
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
```

2. Install backend dependencies:
```bash
cd Backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../Frontend
npm install
```

4. Set up environment variables:
- Copy `.env.example` to `.env` in both Backend and Frontend directories
- Update the values according to your environment

### Running the Application

#### Backend
```bash
cd Backend
npm run dev
```

#### Frontend
```bash
cd Frontend
npm run dev
```

## API Documentation

### REST API Endpoints
- `/api/auth` - Authentication endpoints
- `/api/users` - User management
- `/api/friends` - Friend system
- `/api/messages` - Messaging system
- `/api/calls` - Voice/video call management

### GraphQL API
The GraphQL API provides access to the server, channel, and board systems.

See [SERVER_CHANNEL_SYSTEM.md](Backend/SERVER_CHANNEL_SYSTEM.md) for detailed documentation.

## Frontend Features

### Implemented Features
- Complete authentication flow (login/register)
- Friend system with request/accept functionality
- Real-time messaging between friends
- Server and channel management (Discord-style)
- Trello-style board system with drag-and-drop
- Responsive design for all device sizes
- Real-time updates with Socket.IO

### Frontend Directory Structure
```
Frontend/
├── src/
│   ├── Pages/                 # Page components
│   │   ├── Server/            # Server-related pages
│   │   │   ├── ServerDashboard.jsx
│   │   │   └── ServerPage.jsx
│   │   ├── Chat.jsx           # Direct messaging
│   │   ├── Dashboard.jsx      # Main dashboard
│   │   ├── Login.jsx          # Login page
│   │   └── Register.jsx       # Registration page
│   ├── components/            # Reusable components
│   │   ├── Server/            # Server-specific components
│   │   ├── AddUserForm.jsx    # Friend request form
│   │   ├── PendingRequests.jsx # Friend requests
│   │   ├── NavBar.jsx         # Navigation bar
│   │   └── ProtectedRoute.jsx # Route protection
│   ├── services/              # API service clients
│   │   ├── graphql/           # GraphQL services
│   │   ├── authService.js     # Authentication
│   │   ├── friendService.js   # Friend system
│   │   └── messageService.js  # Messaging
│   ├── contexts/              # React contexts
│   └── config/                # Configuration
└── ...
```

### Frontend Routes
- `/dashboard` - Main dashboard with friends and messaging
- `/servers` - Server management dashboard
- `/server/:serverId` - Individual server view
- `/login` - Login page
- `/register` - Registration page

## Project Structure

```
Collabie/
├── Backend/
│   ├── src/
│   │   ├── models/        # Mongoose models
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API routes
│   │   ├── graphql/       # GraphQL schema and resolvers
│   │   ├── sockets/       # Socket.IO event handlers
│   │   └── middleware/    # Express middleware
│   ├── server.js          # Entry point
│   └── ...
├── Frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service clients
│   │   ├── hooks/         # Custom React hooks
│   │   ├── store/         # Zustand stores
│   │   └── utils/         # Utility functions
│   └── ...
└── ...
```

## Documentation

### Backend Documentation
- [SERVER_CHANNEL_SYSTEM.md](Backend/SERVER_CHANNEL_SYSTEM.md) - GraphQL API documentation
- [DEPLOYMENT.md](Backend/DEPLOYMENT.md) - Deployment instructions

### Frontend Documentation
- [FRONTEND_FEATURES.md](Frontend/FRONTEND_FEATURES.md) - Detailed frontend features
- [FRONTEND_IMPLEMENTATION_SUMMARY.md](FRONTEND_IMPLEMENTATION_SUMMARY.md) - Implementation summary
- [FRONTEND_TESTING_GUIDE.md](FRONTEND_TESTING_GUIDE.md) - Testing instructions

## Testing

### Backend Testing
- Unit tests for all models
- Integration tests for API endpoints
- GraphQL schema validation

### Frontend Testing
- Component import validation
- Manual testing guide provided
- End-to-end user flow testing

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.