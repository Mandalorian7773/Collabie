import React, { useState, useEffect, useRef } from 'react';
import socket from '../../socket.js';
import callService from '../services/callService.js';

function DirectCallView({ currentUser, targetUser, onEndCall }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callType, setCallType] = useState('audio'); // 'audio' or 'video'
  const [error, setError] = useState(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);

  // WebRTC configuration
  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    // Initialize call
    initializeCall();
    
    // Set up socket listeners
    socket.on('direct-call-answer', handleAnswer);
    socket.on('direct-call-ice-candidate', handleIceCandidate);
    socket.on('direct-call-ended', handleCallEnded);
    socket.on('call-error', handleCallError);

    return () => {
      cleanup();
      socket.off('direct-call-answer', handleAnswer);
      socket.off('direct-call-ice-candidate', handleIceCandidate);
      socket.off('direct-call-ended', handleCallEnded);
      socket.off('call-error', handleCallError);
    };
  }, []);

  const initializeCall = async () => {
    try {
      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video',
        audio: true
      });

      setLocalStream(stream);
      
      // Set local video ref
      if (localVideoRef.current && callType === 'video') {
        localVideoRef.current.srcObject = stream;
      }
      
      // Create peer connection
      peerConnection.current = new RTCPeerConnection(configuration);
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, stream);
      });

      // Handle incoming tracks
      peerConnection.current.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('direct-call-ice-candidate', {
            targetUserId: targetUser._id,
            candidate: event.candidate,
            senderUserId: currentUser._id
          });
        }
      };

      // Create offer for outgoing call
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      // Send offer via socket
      socket.emit('direct-call-offer', {
        targetUserId: targetUser._id,
        offer: peerConnection.current.localDescription,
        senderUserId: currentUser._id,
        callType: callType
      });
    } catch (error) {
      console.error('Error initializing call:', error);
      setError('Failed to start call. Please check permissions.');
    }
  };

  const handleAnswer = async (data) => {
    console.log('Received answer:', data);
    if (data.senderUserId === currentUser._id) return;
    
    if (peerConnection.current) {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
  };

  const handleIceCandidate = async (data) => {
    console.log('Received ICE candidate:', data);
    if (data.senderUserId === currentUser._id) return;
    
    if (peerConnection.current) {
      await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  };

  const handleCallEnded = (data) => {
    console.log('Call ended:', data);
    endCall();
  };

  const handleCallError = (data) => {
    console.error('Call error:', data);
    setError(data.message);
    endCall();
  };

  const endCall = () => {
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    // Stop remote stream
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }

    // Close peer connection
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    // Notify parent component
    if (onEndCall) {
      onEndCall();
    }
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream && callType === 'video') {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Call header */}
      <div className="flex items-center justify-between border-b border-zinc-700 p-4 bg-zinc-900 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">
              {targetUser.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold">{targetUser.name || 'Unknown User'}</h2>
            <p className="text-sm text-zinc-400">In Call</p>
          </div>
        </div>
        <button 
          onClick={endCall}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          End Call
        </button>
      </div>
      
      {/* Call content */}
      <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 relative">
        {/* Remote video */}
        <div className="flex-1 bg-black rounded-lg overflow-hidden relative">
          {callType === 'video' && remoteStream ? (
            <video 
              ref={remoteVideoRef}
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">
                    {targetUser.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <p className="text-white">{targetUser.name || 'User'}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Local video (picture-in-picture) */}
        {callType === 'video' && localStream && (
          <div className="w-1/3 md:w-1/4 max-w-xs absolute bottom-4 right-4">
            <div className="bg-black rounded-lg overflow-hidden relative">
              <video 
                ref={localVideoRef}
                autoPlay 
                muted 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                You
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-500 text-white text-center">
          Error: {error}
        </div>
      )}
      
      {/* Call controls */}
      <div className="p-4 bg-zinc-900 border-t border-zinc-700 flex-shrink-0">
        <div className="flex justify-center space-x-6">
          <button
            onClick={toggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-zinc-700 hover:bg-zinc-600'
            } transition-colors`}
          >
            {isMuted ? '🔇' : '🎤'}
          </button>
          
          {callType === 'video' && (
            <button
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isVideoEnabled ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-red-600 hover:bg-red-700'
              } transition-colors`}
            >
              {isVideoEnabled ? '🎥' : '🚫'}
            </button>
          )}
          
          <button
            onClick={endCall}
            className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors"
          >
            📞
          </button>
        </div>
      </div>
    </div>
  );
}

export default DirectCallView;