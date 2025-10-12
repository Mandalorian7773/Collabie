import express from 'express';
import { createApolloServer, createContext } from './src/graphql/graphqlServer.js';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';

async function startMinimalServer() {
    const app = express();
    
    // Add JSON middleware
    app.use(express.json());
    
    // Add CORS
    app.use(cors());
    
    console.log('🔧 Setting up minimal GraphQL server...');
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
        console.log('🚀 Minimal server running on port 3002');
        console.log('🔗 GraphQL endpoint available at http://localhost:3002/graphql');
    });
}

startMinimalServer().catch(console.error);