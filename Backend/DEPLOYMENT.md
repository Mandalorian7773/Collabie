# Backend Deployment Guide

## Overview
This guide explains how to deploy the Collabie backend to various cloud platforms. The backend is a Node.js + Express application with Socket.IO and MongoDB integration.

## Prerequisites
1. MongoDB Atlas account (or other MongoDB hosting)
2. Cloud platform account (Railway, Render, or Vercel)
3. Environment variables configured

## Environment Variables Required

### Essential Variables
```env
# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/collabie

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m

# Security
BCRYPT_SALT_ROUNDS=12

# Server Configuration
NODE_ENV=production
PORT=3001
```

### Optional Variables
```env
# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com
```

## Deployment Options

### Railway (Recommended)
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Railway auto-detects and deploys Node.js apps
4. Automatic SSL and domain provisioning

### Render
1. Create a new Web Service in Render
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Configure environment variables
6. Set health check path to `/api/health`

### Vercel
1. Push vercel.json to your repository
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

## MongoDB Atlas Setup
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Add database user
4. Configure network access (whitelist your deployment IP or 0.0.0.0/0 for testing)
5. Get connection string from "Connect" button
6. Replace username/password in connection string

## Testing Deployment
After deployment, test these endpoints:
- `GET /api/health` - Should return 200 OK
- `GET /api` - Should return API documentation
- `POST /api/auth/register` - Should allow user registration

## Troubleshooting
1. Check logs for MongoDB connection errors
2. Verify all environment variables are set
3. Ensure CORS origin matches your frontend domain
4. Check that PORT is correctly configured for your platform