import dotenv from 'dotenv';
import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import connectDB from './src/config/db.js';
import initSockets from './src/sockets/chatSocket.js';
import app from './src/app.js';
import createApolloServer from './src/graphql/graphqlServer.js';

dotenv.config();

connectDB();

const server = http.createServer(app);

// Enhanced Socket.IO CORS configuration
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : [
      'http://localhost:5173',
      'http://localhost:5174', 
      'http://localhost:5175',
      'https://colabie.netlify.app'
    ];

const io = new Server(server, {
    cors: {
        origin: corsOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

initSockets(io);

// Set up GraphQL server
const apolloServer = createApolloServer();

// Start the server
const PORT = process.env.PORT || 3001;

server.listen(PORT, async () => {
    try {
        // Start Apollo Server
        await apolloServer.start();
        
        // Apply GraphQL middleware
        apolloServer.applyMiddleware({ 
            app, 
            path: '/graphql',
            cors: {
                origin: corsOrigins,
                credentials: true
            }
        });
        
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🌐 Socket.IO enabled on port ${PORT}`);
        console.log(`🔗 GraphQL endpoint available at http://localhost:${PORT}/graphql`);
        console.log(`🔗 API endpoints available at http://localhost:${PORT}/api`);
    } catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
});