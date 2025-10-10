# Frontend Environment Configuration

## Overview
This document explains how to configure the frontend to work with different backend deployments.

## Environment Files

### Development (.env.development)
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
VITE_APP_NAME=Collabie Dev
```

### Production (.env.production)
```env
VITE_API_BASE_URL=https://collabie.onrender.com
VITE_SOCKET_URL=https://collabie.onrender.com
VITE_APP_NAME=Collabie
```

## Configuration Variables

### VITE_API_BASE_URL
- **Purpose**: Base URL for all API requests
- **Default**: `https://collabie.onrender.com`
- **Examples**:
  - Local development: `http://localhost:3001`
  - Render deployment: `https://your-app.onrender.com`
  - Railway deployment: `https://your-app.up.railway.app`

### VITE_SOCKET_URL
- **Purpose**: URL for Socket.IO connections
- **Default**: `https://collabie.onrender.com`
- **Examples**:
  - Local development: `http://localhost:3001`
  - Render deployment: `https://your-app.onrender.com`

### VITE_APP_NAME
- **Purpose**: Application name for display purposes
- **Default**: `Collabie`

## How to Update for Your Deployment

1. **Identify your backend URL**:
   - If deployed on Render: `https://your-app.onrender.com`
   - If deployed on Railway: `https://your-app.up.railway.app`
   - If deployed on Vercel: `https://your-app.vercel.app`

2. **Update .env.production**:
   ```env
   VITE_API_BASE_URL=https://your-backend-url.com
   VITE_SOCKET_URL=https://your-backend-url.com
   ```

3. **Rebuild and redeploy**:
   ```bash
   npm run build
   # Then deploy to your hosting platform
   ```

## Testing the Configuration

### Check API Connection
1. Open your deployed frontend
2. Open browser developer tools
3. Go to Network tab
4. Try to login or register
5. Check if API requests are going to the correct backend URL

### Check Socket Connection
1. Open browser developer tools
2. Go to Console tab
3. Look for Socket.IO connection messages
4. Verify connection is established to the correct URL

## Troubleshooting

### API Requests Failing
- Check that VITE_API_BASE_URL matches your backend deployment
- Verify backend is running and accessible
- Check CORS configuration on backend

### Socket.IO Connection Issues
- Ensure VITE_SOCKET_URL matches your backend URL
- Check that Socket.IO is enabled on your backend deployment
- Verify port configuration (some platforms use different ports)

### Environment Variables Not Loading
- Ensure files are named correctly (.env.production, .env.development)
- Restart development server after changing environment files
- Check that you're using `import.meta.env.VITE_*` syntax