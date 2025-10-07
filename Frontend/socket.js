import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 20000,
    forceNew: true,
});


socket.on('connect', () => {
    console.log('✅ Connected to Socket.IO server on port 3001:', socket.id);
});

socket.on('disconnect', (reason) => {
    console.log('❌ Disconnected from Socket.IO server:', reason);
});

socket.on('connect_error', (error) => {
    console.error('🔥 Socket.IO connection error:', error);
});

socket.on('reconnect', (attemptNumber) => {
    console.log(`🔄 Reconnected to Socket.IO server (attempt ${attemptNumber})`);
});

socket.on('reconnect_error', (error) => {
    console.error('🔥 Socket.IO reconnection error:', error);
});

export default socket;