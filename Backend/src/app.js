import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import messageRoutes from './routes/messageRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();


app.use(helmet());


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);


app.get('/', (req, res) => {
    res.json({ 
        message: 'Collabie API is running!', 
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            messages: '/api/messages'
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

// Health check endpoint for deployment platforms
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

export default app;