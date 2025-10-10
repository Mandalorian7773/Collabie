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

const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'https://colabie.netlify.app'],
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