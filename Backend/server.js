import dotenv from 'dotenv';
import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import connectDB from './src/config/db.js';
import initSockets from './src/sockets/chatSocket.js';
import app from './src/app.js';
// Temporarily comment out GraphQL imports
// import { createApolloServer, expressMiddleware } from './src/graphql/graphqlServer.js';

dotenv.config();

connectDB();

const server = http.createServer(app);

// Enhanced Socket.IO CORS configuration to allow all origins during development
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : process.env.NODE_ENV === 'development'
    ? true // Allow all origins in development
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
const startServer = async () => {
  try {
    // Temporarily comment out GraphQL initialization
    /*
    const apolloServer = await createApolloServer();
    
    // Apply GraphQL middleware
    app.use(
      '/graphql',
      expressMiddleware(apolloServer, {
        context: async ({ req }) => {
          // Get the user token from the headers
          const token = req.headers.authorization || '';
          
          // Try to retrieve a user with the token
          let user = null;
          if (token && token.startsWith('Bearer ')) {
            // Extract the token
            const jwtToken = token.substring(7);
            
            // In a real implementation, you would verify the JWT token here
            // For now, we'll just attach the user from the request if it exists
            user = req.user || null;
          }
          
          return {
            user,
            models: {
              User: {} // You would import and use your actual User model here
            }
          };
        }
      })
    );
    */
    
    // Start the server
    const PORT = process.env.PORT || 3001;
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Socket.IO enabled on port ${PORT}`);
      // Temporarily comment out GraphQL endpoint message
      // console.log(`🔗 GraphQL endpoint available at http://localhost:${PORT}/graphql`);
      console.log(`🔗 API endpoints available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

startServer();