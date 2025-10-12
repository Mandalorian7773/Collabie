import { ApolloServer } from '@apollo/server';
import { makeExecutableSchema } from '@graphql-tools/schema';
import callSchema from './callSchema.js';
import callResolvers from './callResolvers.js';
import { PubSub } from 'graphql-subscriptions';
import User from '../models/userModel.js';
import Server from '../models/serverModel.js';
import Channel from '../models/channelModel.js';
import Board from '../models/boardModel.js';
import JWTUtils from '../utils/jwtUtils.js';

// Import new schemas and resolvers
import serverSchema from './serverSchema.js';
import serverResolvers from './serverResolvers.js';

// Merge all schemas
const typeDefs = [callSchema, serverSchema];

// Create PubSub instance for subscriptions
const pubsub = new PubSub();

// Merge all resolvers
const resolvers = [callResolvers, serverResolvers];

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
  let user = null;
  if (token && token.startsWith('Bearer ')) {
    // Extract the token
    const jwtToken = token.substring(7);
    
    try {
      // Verify the JWT token using the same method as REST API
      const decoded = JWTUtils.verifyAccessToken(jwtToken);
      
      // Fetch the user from the database
      user = await User.findById(decoded.userId).select('-password');
    } catch (error) {
      console.error('JWT verification error:', error);
      // If token verification fails, user remains null
    }
  }
  
  // Add the user to the context
  return {
    user,
    pubsub,
    models: {
      User,
      Server,
      Channel,
      Board
    }
  };
};

// Create Apollo Server
const createApolloServer = async () => {
  const server = new ApolloServer({
    schema,
    introspection: process.env.NODE_ENV !== 'production',
  });
  
  // Start the server
  await server.start();
  
  return server;
};

export { createApolloServer, createContext };