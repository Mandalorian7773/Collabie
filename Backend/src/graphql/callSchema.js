import { gql } from 'graphql-tag';

const callSchema = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    avatar: String
    role: String!
    isActive: Boolean!
    lastActive: String
    emailVerified: Boolean!
    profileSetup: Boolean!
    createdAt: String!
  }

  type Call {
    id: ID!
    roomId: String!
    type: String! # "voice" or "video"
    participants: [User!]!
    startedAt: String
    endedAt: String
    status: String!
    createdBy: User!
    duration: Int
    activeParticipantsCount: Int
  }

  type CallParticipant {
    userId: ID!
    username: String!
    joinedAt: String!
    isMuted: Boolean!
    isVideoEnabled: Boolean!
  }

  type Query {
    # Get active calls by room ID
    activeCallsByRoom(roomId: ID!): [Call!]!
    
    # Get user's active calls
    activeCallsByUser(userId: ID!): [Call!]!
    
    # Get call by ID
    call(id: ID!): Call
  }

  type Mutation {
    # Start a new call
    startCall(roomId: ID!, type: String!): Call!
    
    # End a call
    endCall(callId: ID!): Boolean!
    
    # Join an existing call
    joinCall(callId: ID!): Call!
    
    # Leave a call
    leaveCall(callId: ID!): Boolean!
  }

  type Subscription {
    # Notify when a call starts in a room
    onCallStarted(roomId: ID!): Call!
    
    # Notify when a call ends in a room
    onCallEnded(roomId: ID!): Call!
    
    # Notify when a user joins a call
    onUserJoinedCall(callId: ID!): CallParticipant!
    
    # Notify when a user leaves a call
    onUserLeftCall(callId: ID!): CallParticipant!
  }
`;

export default callSchema;