import Call from '../models/callModel.js';

const initCallSockets = (io) => {
  // Handle WebRTC signaling events
  io.on('connection', (socket) => {
    console.log(`📞 Call socket connected: ${socket.id}`);

    // Join a call room
    socket.on('join-call-room', async (data) => {
      try {
        const { callId, userId } = data;
        
        if (!callId || !userId) {
          socket.emit('call-error', { 
            message: 'Call ID and User ID are required to join a call room' 
          });
          return;
        }

        // Verify the call exists and is active
        const call = await Call.findById(callId);
        if (!call) {
          socket.emit('call-error', { 
            message: 'Call not found' 
          });
          return;
        }

        if (call.status !== 'active') {
          socket.emit('call-error', { 
            message: 'Call is not active' 
          });
          return;
        }

        // Join the call room
        socket.join(callId);
        
        // Notify others in the room that a user joined
        socket.to(callId).emit('user-joined-call', {
          userId,
          callId,
          timestamp: new Date()
        });

        console.log(`👤 User ${userId} joined call room ${callId}`);
        
        // Send confirmation to the user
        socket.emit('joined-call-room', {
          callId,
          message: 'Successfully joined call room'
        });
      } catch (error) {
        console.error('Error joining call room:', error);
        socket.emit('call-error', { 
          message: 'Failed to join call room',
          details: error.message 
        });
      }
    });

    // Leave a call room
    socket.on('leave-call-room', (data) => {
      try {
        const { callId, userId } = data;
        
        if (!callId || !userId) {
          socket.emit('call-error', { 
            message: 'Call ID and User ID are required to leave a call room' 
          });
          return;
        }

        // Leave the call room
        socket.leave(callId);
        
        // Notify others in the room that a user left
        socket.to(callId).emit('user-left-call', {
          userId,
          callId,
          timestamp: new Date()
        });

        console.log(`👋 User ${userId} left call room ${callId}`);
        
        // Send confirmation to the user
        socket.emit('left-call-room', {
          callId,
          message: 'Successfully left call room'
        });
      } catch (error) {
        console.error('Error leaving call room:', error);
        socket.emit('call-error', { 
          message: 'Failed to leave call room',
          details: error.message 
        });
      }
    });

    // WebRTC signaling: Offer
    socket.on('offer', (data) => {
      try {
        const { callId, targetUserId, offer, senderUserId } = data;
        
        if (!callId || !targetUserId || !offer || !senderUserId) {
          socket.emit('call-error', { 
            message: 'Call ID, target user ID, offer, and sender user ID are required' 
          });
          return;
        }

        // Forward the offer to the target user
        socket.to(callId).emit('offer', {
          callId,
          senderUserId,
          targetUserId,
          offer,
          timestamp: new Date()
        });

        console.log(`📤 Offer sent from ${senderUserId} to ${targetUserId} in call ${callId}`);
      } catch (error) {
        console.error('Error sending offer:', error);
        socket.emit('call-error', { 
          message: 'Failed to send offer',
          details: error.message 
        });
      }
    });

    // WebRTC signaling: Answer
    socket.on('answer', (data) => {
      try {
        const { callId, targetUserId, answer, senderUserId } = data;
        
        if (!callId || !targetUserId || !answer || !senderUserId) {
          socket.emit('call-error', { 
            message: 'Call ID, target user ID, answer, and sender user ID are required' 
          });
          return;
        }

        // Forward the answer to the target user
        socket.to(callId).emit('answer', {
          callId,
          senderUserId,
          targetUserId,
          answer,
          timestamp: new Date()
        });

        console.log(`📤 Answer sent from ${senderUserId} to ${targetUserId} in call ${callId}`);
      } catch (error) {
        console.error('Error sending answer:', error);
        socket.emit('call-error', { 
          message: 'Failed to send answer',
          details: error.message 
        });
      }
    });

    // WebRTC signaling: ICE Candidate
    socket.on('ice-candidate', (data) => {
      try {
        const { callId, targetUserId, candidate, senderUserId } = data;
        
        if (!callId || !targetUserId || !candidate || !senderUserId) {
          socket.emit('call-error', { 
            message: 'Call ID, target user ID, candidate, and sender user ID are required' 
          });
          return;
        }

        // Forward the ICE candidate to the target user
        socket.to(callId).emit('ice-candidate', {
          callId,
          senderUserId,
          targetUserId,
          candidate,
          timestamp: new Date()
        });

        console.log(`📤 ICE candidate sent from ${senderUserId} to ${targetUserId} in call ${callId}`);
      } catch (error) {
        console.error('Error sending ICE candidate:', error);
        socket.emit('call-error', { 
          message: 'Failed to send ICE candidate',
          details: error.message 
        });
      }
    });

    // Call control events
    socket.on('toggle-mute', (data) => {
      try {
        const { callId, userId, isMuted } = data;
        
        if (!callId || !userId) {
          socket.emit('call-error', { 
            message: 'Call ID and User ID are required' 
          });
          return;
        }

        // Notify others in the call room about the mute status change
        socket.to(callId).emit('user-mute-status-changed', {
          userId,
          isMuted,
          callId,
          timestamp: new Date()
        });

        console.log(`🔊 User ${userId} mute status changed to ${isMuted} in call ${callId}`);
      } catch (error) {
        console.error('Error toggling mute:', error);
        socket.emit('call-error', { 
          message: 'Failed to toggle mute',
          details: error.message 
        });
      }
    });

    socket.on('toggle-video', (data) => {
      try {
        const { callId, userId, isVideoEnabled } = data;
        
        if (!callId || !userId) {
          socket.emit('call-error', { 
            message: 'Call ID and User ID are required' 
          });
          return;
        }

        // Notify others in the call room about the video status change
        socket.to(callId).emit('user-video-status-changed', {
          userId,
          isVideoEnabled,
          callId,
          timestamp: new Date()
        });

        console.log(`📹 User ${userId} video status changed to ${isVideoEnabled} in call ${callId}`);
      } catch (error) {
        console.error('Error toggling video:', error);
        socket.emit('call-error', { 
          message: 'Failed to toggle video',
          details: error.message 
        });
      }
    });

    socket.on('screen-share-started', (data) => {
      try {
        const { callId, userId } = data;
        
        if (!callId || !userId) {
          socket.emit('call-error', { 
            message: 'Call ID and User ID are required' 
          });
          return;
        }

        // Notify others in the call room about screen share start
        socket.to(callId).emit('user-screen-share-started', {
          userId,
          callId,
          timestamp: new Date()
        });

        console.log(`🖥️ User ${userId} started screen sharing in call ${callId}`);
      } catch (error) {
        console.error('Error starting screen share:', error);
        socket.emit('call-error', { 
          message: 'Failed to start screen share',
          details: error.message 
        });
      }
    });

    socket.on('screen-share-ended', (data) => {
      try {
        const { callId, userId } = data;
        
        if (!callId || !userId) {
          socket.emit('call-error', { 
            message: 'Call ID and User ID are required' 
          });
          return;
        }

        // Notify others in the call room about screen share end
        socket.to(callId).emit('user-screen-share-ended', {
          userId,
          callId,
          timestamp: new Date()
        });

        console.log(`🖥️ User ${userId} ended screen sharing in call ${callId}`);
      } catch (error) {
        console.error('Error ending screen share:', error);
        socket.emit('call-error', { 
          message: 'Failed to end screen share',
          details: error.message 
        });
      }
    });

    // Handle socket disconnection
    socket.on('disconnect', () => {
      console.log(`📞 Call socket disconnected: ${socket.id}`);
    });

    // Handle socket errors
    socket.on('error', (error) => {
      console.error(`🔥 Call socket error for ${socket.id}:`, error);
    });
  });

  console.log('🚀 Call Socket.IO initialized and ready for WebRTC signaling');
};

export default initCallSockets;