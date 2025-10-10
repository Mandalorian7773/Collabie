import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import messageRoutes from './routes/messageRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import callRoutes from './routes/callRoutes.js';
import friendRoutes from './routes/friendRoutes.js';

const app = express();

app.use(helmet());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Enhanced CORS configuration to allow all origins and endpoints
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow all origins in development
        if (process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        
        // Allow all origins in production (you might want to restrict this in production)
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Authorization'],
    optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use(morgan('combined'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/friends', friendRoutes);

// Health check endpoint for deployment platforms
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/', (req, res) => {
    res.json({ 
        message: 'Collabie API is running!', 
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            messages: '/api/messages',
            calls: '/api/calls',
            friends: '/api/friends'  
        }
    });
});

app.get('/api', (req, res) => {
    res.json({
        name: 'Collabie Chat API',
        version: '1.0.0',
        description: 'Real-time chat application API',
        endpoints: {
            authentication: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                refresh: 'POST /api/auth/refresh',
                logout: 'POST /api/auth/logout',
                profile: 'GET /api/auth/me',
                updateProfile: 'PUT /api/auth/profile',
                changePassword: 'PUT /api/auth/change-password'
            },
            users: {
                getUsers: 'GET /api/users',
                addUser: 'POST /api/users/add',
                searchUsers: 'GET /api/users/search'
            },
            messages: {
                send: 'POST /api/messages',
                getMessages: 'GET /api/messages/:userId1/:userId2'
            },
            calls: {
                startCall: 'POST /api/calls/start',
                joinCall: 'POST /api/calls/join/:callId',
                leaveCall: 'POST /api/calls/leave/:callId',
                endCall: 'POST /api/calls/end/:callId',
                getActiveCallsByRoom: 'GET /api/calls/room/:roomId',
                getActiveCallsByUser: 'GET /api/calls/user/:userId'
            },
            friends: {
                sendRequest: 'POST /api/friends/request',
                acceptRequest: 'POST /api/friends/accept/:requestId',
                declineRequest: 'POST /api/friends/decline/:requestId',
                getFriends: 'GET /api/friends',
                getPendingRequests: 'GET /api/friends/pending',
                removeFriend: 'DELETE /api/friends/:friendId'
            }
        }
    });
});

app.use((req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        path: req.originalUrl 
    });
});

app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

export default app;