import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './src/config/db.js';
import initSockets from './src/sockets/chatSocket.js';
import { createApp } from './src/app.js';

dotenv.config();

connectDB();

// Set up the server
const startServer = async () => {
  try {
    // Create and configure the app
    console.log('🔧 Creating and configuring app...');
    const app = await createApp();
    console.log('✅ App created and configured successfully');
    
    // Create the HTTP server
    const server = http.createServer(app);

    // Enhanced Socket.IO CORS configuration to allow localhost origins for development
    const corsOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
      : [
          'http://localhost:5173',
          'http://localhost:5174', 
          'http://localhost:5175',
          'https://colabie.netlify.app',
          // Allow all localhost origins for development
          ...(process.env.NODE_ENV === 'development' ? ['*'] : [])
        ];

    // Always allow localhost origins for development/testing
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174', 
      'http://localhost:5175',
      'https://colabie.netlify.app'
    ];

    // In development, allow all origins
    const socketCorsOptions = {
      origin: process.env.NODE_ENV === 'development' 
        ? '*' 
        : allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true
    };

    const io = new Server(server, {
        cors: socketCorsOptions
    });

    initSockets(io);

    // Start the server
    const PORT = process.env.PORT || 3001;
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Socket.IO enabled on port ${PORT}`);
      console.log(`🔗 GraphQL endpoint available at http://localhost:${PORT}/graphql`);
      console.log(`🔗 API endpoints available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

startServer();