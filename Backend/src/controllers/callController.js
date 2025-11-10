import Call from '../models/callModel.js';
import User from '../models/userModel.js';

class CallController {
  // Get active calls by room ID
  static async getActiveCallsByRoom(req, res) {
    try {
      const { roomId } = req.params;
      
      if (!roomId) {
        return res.status(400).json({
          success: false,
          error: 'Room ID is required'
        });
      }

      const calls = await Call.findActiveCallsByRoom(roomId)
        .populate('participants', 'username email avatar role')
        .populate('createdBy', 'username email avatar role');

      res.json({
        success: true,
        calls
      });
    } catch (error) {
      console.error('Error fetching active calls by room:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch active calls',
        details: error.message
      });
    }
  }

  // Get user's active calls
  static async getActiveCallsByUser(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      const calls = await Call.findActiveCallsByUser(userId)
        .populate('participants', 'username email avatar role')
        .populate('createdBy', 'username email avatar role');

      res.json({
        success: true,
        calls
      });
    } catch (error) {
      console.error('Error fetching user active calls:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user active calls',
        details: error.message
      });
    }
  }

  // Start a new call
  static async startCall(req, res) {
    try {
      const { roomId, type } = req.body;
      const userId = req.user.id; // Assuming user is attached to req by auth middleware

      if (!roomId || !type) {
        return res.status(400).json({
          success: false,
          error: 'Room ID and call type are required'
        });
      }

      if (!['voice', 'video'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Call type must be either "voice" or "video"'
        });
      }

      // Create a new call
      const call = new Call({
        roomId,
        type,
        participants: [userId],
        createdBy: userId
      });

      await call.save();

      // Populate the participants and createdBy fields
      await call.populate('participants', 'username email avatar role');
      await call.populate('createdBy', 'username email avatar role');

      res.status(201).json({
        success: true,
        call,
        message: 'Call started successfully'
      });
    } catch (error) {
      console.error('Error starting call:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start call',
        details: error.message
      });
    }
  }

  // End a call
  static async endCall(req, res) {
    try {
      const { callId } = req.params;
      const userId = req.user.id;

      if (!callId) {
        return res.status(400).json({
          success: false,
          error: 'Call ID is required'
        });
      }

      // Find the call
      const call = await Call.findById(callId);
      if (!call) {
        return res.status(404).json({
          success: false,
          error: 'Call not found'
        });
      }

      // Check if user is the creator or a participant
      const isCreator = call.createdBy.toString() === userId;
      const isParticipant = call.participants.some(
        participant => participant.toString() === userId
      );

      if (!isCreator && !isParticipant) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to end this call'
        });
      }

      // End the call
      await call.endCall();

      res.json({
        success: true,
        message: 'Call ended successfully'
      });
    } catch (error) {
      console.error('Error ending call:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to end call',
        details: error.message
      });
    }
  }

  // Get call details
  static async getCallDetails(req, res) {
    try {
      const { callId } = req.params;
      
      if (!callId) {
        return res.status(400).json({
          success: false,
          error: 'Call ID is required'
        });
      }

      const call = await Call.findById(callId)
        .populate('participants', 'username email avatar role')
        .populate('createdBy', 'username email avatar role');

      if (!call) {
        return res.status(404).json({
          success: false,
          error: 'Call not found'
        });
      }

      res.json({
        success: true,
        call
      });
    } catch (error) {
      console.error('Error fetching call details:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch call details',
        details: error.message
      });
    }
  }

  // Update call settings
  static async updateCallSettings(req, res) {
    try {
      const { callId } = req.params;
      const { settings } = req.body;
      const userId = req.user.id;

      if (!callId) {
        return res.status(400).json({
          success: false,
          error: 'Call ID is required'
        });
      }

      // Find the call
      const call = await Call.findById(callId);
      if (!call) {
        return res.status(404).json({
          success: false,
          error: 'Call not found'
        });
      }

      // Check if user is the creator
      const isCreator = call.createdBy.toString() === userId;
      if (!isCreator) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update call settings'
        });
      }

      // Update call settings (in a real implementation, you might store these in the database)
      // For now, we'll just return success
      res.json({
        success: true,
        message: 'Call settings updated successfully'
      });
    } catch (error) {
      console.error('Error updating call settings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update call settings',
        details: error.message
      });
    }
  }

  // Join an existing call
  static async joinCall(req, res) {
    try {
      const { callId } = req.params;
      const userId = req.user.id;

      if (!callId) {
        return res.status(400).json({
          success: false,
          error: 'Call ID is required'
        });
      }

      // Find the call
      const call = await Call.findById(callId);
      if (!call) {
        return res.status(404).json({
          success: false,
          error: 'Call not found'
        });
      }

      // Check if call is active
      if (call.status !== 'active') {
        return res.status(400).json({
          success: false,
          error: 'Call is not active'
        });
      }

      // Check if user is already in the call
      const isAlreadyParticipant = call.participants.some(
        participant => participant.toString() === userId
      );

      if (!isAlreadyParticipant) {
        // Add user to participants
        call.participants.push(userId);
        await call.save();
      }

      // Populate the participants and createdBy fields
      await call.populate('participants', 'username email avatar role');
      await call.populate('createdBy', 'username email avatar role');

      res.json({
        success: true,
        call,
        message: 'Joined call successfully'
      });
    } catch (error) {
      console.error('Error joining call:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to join call',
        details: error.message
      });
    }
  }

  // Leave a call
  static async leaveCall(req, res) {
    try {
      const { callId } = req.params;
      const userId = req.user.id;

      if (!callId) {
        return res.status(400).json({
          success: false,
          error: 'Call ID is required'
        });
      }

      // Find the call
      const call = await Call.findById(callId);
      if (!call) {
        return res.status(404).json({
          success: false,
          error: 'Call not found'
        });
      }

      // Check if call is active
      if (call.status !== 'active') {
        return res.status(400).json({
          success: false,
          error: 'Call is not active'
        });
      }

      // Remove user from participants
      const initialParticipantCount = call.participants.length;
      call.participants = call.participants.filter(
        participant => participant.toString() !== userId
      );

      // If no participants left, end the call
      if (call.participants.length === 0) {
        await call.endCall();
      } else if (call.participants.length < initialParticipantCount) {
        // Only save if a participant was actually removed
        await call.save();
      }

      res.json({
        success: true,
        message: 'Left call successfully'
      });
    } catch (error) {
      console.error('Error leaving call:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to leave call',
        details: error.message
      });
    }
  }
}

export default CallController;