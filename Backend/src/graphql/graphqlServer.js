import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import callSchema from './callSchema.js';
import callResolvers from './callResolvers.js';
import User from '../models/userModel.js';

// Merge all schemas
const typeDefs = [callSchema];

// Merge all resolvers
const resolvers = [callResolvers];

// Create executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

// Context function to add user to GraphQL context
const createContext = async ({ req }) => {
  // Get the user token from the headers
  const token = req.headers.authorization || '';
  
  // Try to retrieve a user with the token
  // Note: This is a simplified example. In a real app, you would verify the JWT token
  // and retrieve the user from the database
  let user = null;
  if (token && token.startsWith('Bearer ')) {
    // Extract the token
    const jwtToken = token.substring(7);
    
    // In a real implementation, you would verify the JWT token here
    // For now, we'll just attach the user from the request if it exists
    user = req.user || null;
  }
  
  // Add the user to the context
  return {
    user,
    models: {
      User
    }
  };
};

// Create Apollo Server
const createApolloServer = () => {
  return new ApolloServer({
    schema,
    context: createContext,
    introspection: process.env.NODE_ENV !== 'production',
    playground: process.env.NODE_ENV !== 'production'
  });
};

export default createApolloServer;