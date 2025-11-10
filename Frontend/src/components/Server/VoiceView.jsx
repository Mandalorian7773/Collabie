import React, { useState, useEffect, useRef } from 'react';
import socket from '../../../socket';
import callService from '../../../services/callService';

function VoiceView({ channel, user }) {
  const [isInCall, setIsInCall] = useState(false);
  const [callId, setCallId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [error, setError] = useState(null);
  
  const screenStreamRef = useRef(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});

  // WebRTC configuration
  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Peer connections map
  const peerConnections = useRef({});

  useEffect(() => {
    // Listen for call events
    socket.on('user-joined-call', handleUserJoinedCall);
    socket.on('user-left-call', handleUserLeftCall);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('user-mute-status-changed', handleUserMuteStatusChanged);
    socket.on('user-video-status-changed', handleUserVideoStatusChanged);
    socket.on('call-error', handleCallError);

    return () => {
      // Clean up event listeners
      socket.off('user-joined-call', handleUserJoinedCall);
      socket.off('user-left-call', handleUserLeftCall);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('user-mute-status-changed', handleUserMuteStatusChanged);
      socket.off('user-video-status-changed', handleUserVideoStatusChanged);
      socket.off('call-error', handleCallError);
      
      // Clean up streams and connections
      cleanup();
    };
  }, []);

  const handleUserJoinedCall = (data) => {
    console.log('User joined call:', data);
    setParticipants(prev => {
      if (!prev.find(p => p.userId === data.userId)) {
        return [...prev, { userId: data.userId, isMuted: false, isVideoEnabled: true }];
      }
      return prev;
    });
    
    // If this is not us, create an offer
    if (data.userId !== user._id) {
      createOffer(data.userId);
    }
  };

  const handleUserLeftCall = (data) => {
    console.log('User left call:', data);
    setParticipants(prev => prev.filter(p => p.userId !== data.userId));
    
    // Close peer connection
    if (peerConnections.current[data.userId]) {
      peerConnections.current[data.userId].close();
      delete peerConnections.current[data.userId];
    }
    
    // Remove remote stream
    setRemoteStreams(prev => {
      const newStreams = { ...prev };
      delete newStreams[data.userId];
      return newStreams;
    });
  };

  const handleOffer = async (data) => {
    console.log('Received offer:', data);
    if (data.senderUserId === user._id) return;
    
    const pc = createPeerConnection(data.senderUserId);
    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    socket.emit('answer', {
      callId: data.callId,
      targetUserId: data.senderUserId,
      answer: pc.localDescription,
      senderUserId: user._id
    });
  };

  const handleAnswer = async (data) => {
    console.log('Received answer:', data);
    if (data.senderUserId === user._id) return;
    
    const pc = peerConnections.current[data.senderUserId];
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
  };

  const handleIceCandidate = async (data) => {
    console.log('Received ICE candidate:', data);
    if (data.senderUserId === user._id) return;
    
    const pc = peerConnections.current[data.senderUserId];
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  };

  const handleUserMuteStatusChanged = (data) => {
    setParticipants(prev => 
      prev.map(p => 
        p.userId === data.userId ? { ...p, isMuted: data.isMuted } : p
      )
    );
  };

  const handleUserVideoStatusChanged = (data) => {
    setParticipants(prev => 
      prev.map(p => 
        p.userId === data.userId ? { ...p, isVideoEnabled: data.isVideoEnabled } : p
      )
    );
  };

  const handleCallError = (data) => {
    console.error('Call error:', data);
    setError(data.message);
  };

  const createPeerConnection = (userId) => {
    if (peerConnections.current[userId]) {
      return peerConnections.current[userId];
    }
    
    const pc = new RTCPeerConnection(configuration);
    
    // Add local stream to peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }
    
    // Handle incoming tracks
    pc.ontrack = (event) => {
      console.log('Received remote track:', event);
      setRemoteStreams(prev => ({
        ...prev,
        [userId]: event.streams[0]
      }));
      
      // Set video ref when it becomes available
      if (remoteVideoRefs.current[userId]) {
        remoteVideoRefs.current[userId].srcObject = event.streams[0];
      }
    };
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && callId) {
        socket.emit('ice-candidate', {
          callId,
          targetUserId: userId,
          candidate: event.candidate,
          senderUserId: user._id
        });
      }
    };
    
    peerConnections.current[userId] = pc;
    return pc;
  };

  const createOffer = async (targetUserId) => {
    const pc = createPeerConnection(targetUserId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    socket.emit('offer', {
      callId,
      targetUserId,
      offer: pc.localDescription,
      senderUserId: user._id
    });
  };

  const getMediaStream = async (isScreenShare = false) => {
    try {
      let stream;
      
      if (isScreenShare) {
        // Get screen sharing stream
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        // Listen for when screen sharing stops
        stream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };
        
        setIsScreenSharing(true);
        screenStreamRef.current = stream;
      } else {
        // Get regular media stream
        stream = await navigator.mediaDevices.getUserMedia({
          video: isVideoEnabled,
          audio: true
        });
      }
      
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (err) {
      console.error('Error getting media stream:', err);
      setError('Failed to access camera/microphone. Please check permissions.');
      return null;
    }
  };

  const joinCall = async () => {
    try {
      setError(null);
      
      // Get media stream first
      const stream = await getMediaStream();
      if (!stream) return;
      
      // Start a new call via service
      const result = await callService.startCall({
        roomId: channel.id,
        type: 'video' // Always use video for voice channels now
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to start call');
      }
      
      const data = { success: true, call: result.call };
      
      if (data.success) {
        const newCallId = data.call._id;
        setCallId(newCallId);
        setIsInCall(true);
        setParticipants([{ userId: user._id, isMuted: false, isVideoEnabled: isVideoEnabled }]);
        
        // Join the call room via socket
        socket.emit('join-call-room', {
          callId: newCallId,
          userId: user._id
        });
      } else {
        throw new Error(data.error || 'Failed to start call');
      }
    } catch (err) {
      console.error('Error joining call:', err);
      setError(err.message || 'Failed to join call');
      cleanup();
    }
  };

  const leaveCall = async () => {
    try {
      if (callId) {
        // Leave the call room via socket
        socket.emit('leave-call-room', {
          callId,
          userId: user._id
        });
        
        // End the call via service
        await callService.endCall(callId);
      }
    } catch (err) {
      console.error('Error leaving call:', err);
    } finally {
      setIsInCall(false);
      setCallId(null);
      setParticipants([]);
      cleanup();
    }
  };

  const cleanup = () => {
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    // Close all peer connections
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};
    
    // Clear remote streams
    setRemoteStreams({});
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
      
      // Notify others
      if (callId) {
        socket.emit('toggle-mute', {
          callId,
          userId: user._id,
          isMuted: !isMuted
        });
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
      
      // Notify others
      if (callId) {
        socket.emit('toggle-video', {
          callId,
          userId: user._id,
          isVideoEnabled: !isVideoEnabled
        });
      }
    }
  };

  const startScreenShare = async () => {
    if (isScreenSharing) return;
    
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      // Replace video track in peer connections
      Object.values(peerConnections.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          const screenTrack = screenStream.getVideoTracks()[0];
          sender.replaceTrack(screenTrack);
        }
      });
      
      // Listen for when screen sharing stops
      screenStream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
      
      setIsScreenSharing(true);
      screenStreamRef.current = screenStream;
      
      // Notify others
      if (callId) {
        socket.emit('screen-share-started', {
          callId,
          userId: user._id
        });
      }
    } catch (err) {
      console.error('Error starting screen share:', err);
      setError('Failed to start screen sharing.');
    }
  };

  const stopScreenShare = () => {
    if (!isScreenSharing || !screenStreamRef.current) return;
    
    // Stop screen sharing tracks
    screenStreamRef.current.getTracks().forEach(track => track.stop());
    
    // Replace with original video track if available
    if (localStream) {
      Object.values(peerConnections.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          const videoTrack = localStream.getVideoTracks()[0];
          sender.replaceTrack(videoTrack);
        }
      });
    }
    
    setIsScreenSharing(false);
    screenStreamRef.current = null;
    
    // Notify others
    if (callId) {
      socket.emit('screen-share-ended', {
        callId,
        userId: user._id
      });
    }
  };

  const toggleScreenShare = () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800">
      {error && (
        <div className="p-4 bg-red-500 text-white">
          Error: {error}
        </div>
      )}
      
      {!isInCall ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎤</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Voice/Video Channel</h3>
            <p className="text-gray-400 mb-4">
              Join the call to start voice/video communication
            </p>
            <button 
              onClick={joinCall}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg transition-colors font-semibold"
            >
              Join Call
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Call header */}
          <div className="p-4 border-b border-gray-700 bg-gray-900">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {channel.name} - {participants.length} participant{participants.length !== 1 ? 's' : ''}
              </h2>
              <button 
                onClick={leaveCall}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded transition-colors"
              >
                Leave Call
              </button>
            </div>
          </div>
          
          {/* Video area */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Local video */}
              <div className="relative bg-gray-700 rounded-lg overflow-hidden aspect-video">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  You
                </div>
                {isMuted && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
                    Muted
                  </div>
                )}
              </div>
              
              {/* Remote videos */}
              {Object.keys(remoteStreams).map(userId => (
                <div key={userId} className="relative bg-gray-700 rounded-lg overflow-hidden aspect-video">
                  <video
                    ref={el => remoteVideoRefs.current[userId] = el}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    Participant
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Call controls */}
          <div className="p-4 border-t border-gray-700 bg-gray-900">
            <div className="flex justify-center space-x-4">
              <button
                onClick={toggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isMuted ? 'bg-red-600 hover:bg-red-500' : 'bg-gray-600 hover:bg-gray-500'
                } transition-colors`}
              >
                {isMuted ? '🔇' : '🎤'}
              </button>
              
              <button
                onClick={toggleVideo}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isVideoEnabled ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'
                } transition-colors`}
              >
                {isVideoEnabled ? '🎥' : '🚫'}
              </button>
              
              <button
                onClick={toggleScreenShare}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isScreenSharing ? 'bg-purple-600 hover:bg-purple-500' : 'bg-gray-600 hover:bg-gray-500'
                } transition-colors`}
              >
                🖥️
              </button>
              
              <button
                onClick={leaveCall}
                className="w-12 h-12 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
              >
                📞
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default VoiceView;