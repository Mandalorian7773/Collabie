import Call from '../models/callModel.js';
import User from '../models/userModel.js';

const callResolvers = {
  Query: {
    activeCallsByRoom: async (_, { roomId }) => {
      try {
        const calls = await Call.findActiveCallsByRoom(roomId)
          .populate('participants', 'username email avatar role isActive lastActive emailVerified profileSetup createdAt')
          .populate('createdBy', 'username email avatar role isActive lastActive emailVerified profileSetup createdAt');
        return calls;
      } catch (error) {
        throw new Error(`Failed to fetch active calls: ${error.message}`);
      }
    },

    activeCallsByUser: async (_, { userId }) => {
      try {
        const calls = await Call.findActiveCallsByUser(userId)
          .populate('participants', 'username email avatar role isActive lastActive emailVerified profileSetup createdAt')
          .populate('createdBy', 'username email avatar role isActive lastActive emailVerified profileSetup createdAt');
        return calls;
      } catch (error) {
        throw new Error(`Failed to fetch user's active calls: ${error.message}`);
      }
    },

    call: async (_, { id }) => {
      try {
        const call = await Call.findById(id)
          .populate('participants', 'username email avatar role isActive lastActive emailVerified profileSetup createdAt')
          .populate('createdBy', 'username email avatar role isActive lastActive emailVerified profileSetup createdAt');
        return call;
      } catch (error) {
        throw new Error(`Failed to fetch call: ${error.message}`);
      }
    }
  },

  Mutation: {
    startCall: async (_, { roomId, type }, { user }) => {
      try {
        // Check if user is authenticated
        if (!user) {
          throw new Error('Authentication required');
        }

        // Create a new call
        const call = new Call({
          roomId,
          type,
          participants: [user.id],
          createdBy: user.id
        });

        await call.save();

        // Populate the participants and createdBy fields
        await call.populate('participants', 'username email avatar role isActive lastActive emailVerified profileSetup createdAt');
        await call.populate('createdBy', 'username email avatar role isActive lastActive emailVerified profileSetup createdAt');

        return call;
      } catch (error) {
        throw new Error(`Failed to start call: ${error.message}`);
      }
    },

    endCall: async (_, { callId }, { user }) => {
      try {
        // Check if user is authenticated
        if (!user) {
          throw new Error('Authentication required');
        }

        // Find the call
        const call = await Call.findById(callId);
        if (!call) {
          throw new Error('Call not found');
        }

        // Check if user is the creator or a participant
        const isCreator = call.createdBy.toString() === user.id;
        const isParticipant = call.participants.some(
          participant => participant.toString() === user.id
        );

        if (!isCreator && !isParticipant) {
          throw new Error('Not authorized to end this call');
        }

        // End the call
        await call.endCall();

        return true;
      } catch (error) {
        throw new Error(`Failed to end call: ${error.message}`);
      }
    },

    joinCall: async (_, { callId }, { user }) => {
      try {
        // Check if user is authenticated
        if (!user) {
          throw new Error('Authentication required');
        }

        // Find the call
        const call = await Call.findById(callId);
        if (!call) {
          throw new Error('Call not found');
        }

        // Check if call is active
        if (call.status !== 'active') {
          throw new Error('Call is not active');
        }

        // Check if user is already in the call
        const isAlreadyParticipant = call.participants.some(
          participant => participant.toString() === user.id
        );

        if (!isAlreadyParticipant) {
          // Add user to participants
          call.participants.push(user.id);
          await call.save();
        }

        // Populate the participants and createdBy fields
        await call.populate('participants', 'username email avatar role isActive lastActive emailVerified profileSetup createdAt');
        await call.populate('createdBy', 'username email avatar role isActive lastActive emailVerified profileSetup createdAt');

        return call;
      } catch (error) {
        throw new Error(`Failed to join call: ${error.message}`);
      }
    },

    leaveCall: async (_, { callId }, { user }) => {
      try {
        // Check if user is authenticated
        if (!user) {
          throw new Error('Authentication required');
        }

        // Find the call
        const call = await Call.findById(callId);
        if (!call) {
          throw new Error('Call not found');
        }

        // Check if call is active
        if (call.status !== 'active') {
          throw new Error('Call is not active');
        }

        // Remove user from participants
        call.participants = call.participants.filter(
          participant => participant.toString() !== user.id
        );

        // If no participants left, end the call
        if (call.participants.length === 0) {
          await call.endCall();
        } else {
          await call.save();
        }

        return true;
      } catch (error) {
        throw new Error(`Failed to leave call: ${error.message}`);
      }
    }
  },

  Call: {
    id: (call) => call.id,
    duration: (call) => call.duration,
    activeParticipantsCount: (call) => call.activeParticipantsCount
  },

  User: {
    id: (user) => user.id,
    username: (user) => user.username,
    email: (user) => user.email,
    avatar: (user) => user.avatar,
    role: (user) => user.role,
    isActive: (user) => user.isActive,
    lastActive: (user) => user.lastActive?.toISOString(),
    emailVerified: (user) => user.emailVerified,
    profileSetup: (user) => user.profileSetup,
    createdAt: (user) => user.createdAt?.toISOString()
  }
};

export default callResolvers;