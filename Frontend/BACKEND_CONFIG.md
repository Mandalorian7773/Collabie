# Development Backend Configuration

## Overview
This document explains how to configure your frontend to work with either a local backend or the deployed backend.

## Current Configuration
Your frontend is currently configured to connect to the deployed backend:
- API: `https://collabie.onrender.com`
- Socket.IO: `https://collabie.onrender.com`

## Switching to Local Backend

### 1. Update .env.development
Uncomment the local backend configuration and comment out the deployed backend configuration:

```env
# Development Environment Variables

# For local development, uncomment the lines below and run your backend locally
VITE_API_BASE_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001

# For development with deployed backend (default)
# VITE_API_BASE_URL=https://collabie.onrender.com
# VITE_SOCKET_URL=https://collabie.onrender.com

VITE_APP_NAME=Collabie Dev
```

### 2. Start Local Backend
In a separate terminal, start your backend:

```bash
cd Backend
npm run dev
```

### 3. Restart Frontend
Restart your frontend development server:

```bash
cd Frontend
npm run dev
```

## Switching Back to Deployed Backend

### 1. Update .env.development
Comment out the local backend configuration and uncomment the deployed backend configuration:

```env
# Development Environment Variables

# For local development, uncomment the lines below and run your backend locally
# VITE_API_BASE_URL=http://localhost:3001
# VITE_SOCKET_URL=http://localhost:3001

# For development with deployed backend (default)
VITE_API_BASE_URL=https://collabie.onrender.com
VITE_SOCKET_URL=https://collabie.onrender.com

VITE_APP_NAME=Collabie Dev
```

### 2. Restart Frontend
Restart your frontend development server:

```bash
cd Frontend
npm run dev
```

## Troubleshooting

### Socket.IO Connection Issues
1. **Check backend status**: Ensure your backend is running
2. **Verify URLs**: Make sure API_BASE_URL and SOCKET_URL are correct
3. **Check CORS**: Ensure your backend allows connections from your frontend origin
4. **Network issues**: Verify there are no firewall or network restrictions

### API Request Failures
1. **Check backend logs**: Look for error messages in backend console
2. **Verify endpoints**: Ensure API endpoints exist and are correctly configured
3. **Authentication**: Check that authentication tokens are valid
4. **Network connectivity**: Verify the backend URL is accessible

## Environment Variables Reference

### VITE_API_BASE_URL
- **Purpose**: Base URL for all HTTP API requests
- **Default (development)**: `https://collabie.onrender.com`
- **Local development**: `http://localhost:3001`

### VITE_SOCKET_URL
- **Purpose**: URL for Socket.IO connections
- **Default (development)**: `https://collabie.onrender.com`
- **Local development**: `http://localhost:3001`

### VITE_APP_NAME
- **Purpose**: Application name for display purposes
- **Default**: `Collabie Dev`