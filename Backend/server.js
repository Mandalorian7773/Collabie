import dotenv from 'dotenv';
import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import connectDB from './src/config/db.js';
import initSockets from './src/sockets/chatSocket.js';
import app from './src/app.js';

dotenv.config();

connectDB();

const server = http.createServer(app);

// Allow Socket.IO connections from any origin (development only - restrict in production)
const io = new Server(server, {
    cors: {
        origin: true, // Allow all origins
        methods: ["GET", "POST"],
        credentials: true
    }
});

initSockets(io);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Socket.IO enabled on port ${PORT}`);
    console.log(`🔗 API endpoints available at http://localhost:${PORT}/api`);
});