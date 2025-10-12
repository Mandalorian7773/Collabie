import express from 'express';
import { createApolloServer, createContext } from './src/graphql/graphqlServer.js';
import { expressMiddleware } from '@apollo/server/express4';

const app = express();

// Simple middleware to log all requests
app.use((req, res, next) => {
    console.log(`🔍 Request: ${req.method} ${req.path}`);
    next();
});

const setupTestGraphQL = async () => {
    try {
        console.log('🔧 Setting up test GraphQL server...');
        const apolloServer = await createApolloServer();
        console.log('✅ Apollo Server created successfully');
        
        // Apply GraphQL middleware
        app.use('/graphql', expressMiddleware(apolloServer, {
            context: createContext
        }));
        
        console.log('✅ GraphQL middleware applied');
        
        // Add a simple test endpoint
        app.get('/test', (req, res) => {
            res.json({ message: 'Test endpoint working' });
        });
        
        app.listen(3002, () => {
            console.log('🚀 Test server running on port 3002');
            console.log('🔗 GraphQL endpoint available at http://localhost:3002/graphql');
        });
    } catch (error) {
        console.error('❌ Error setting up test GraphQL:', error);
    }
};

setupTestGraphQL();