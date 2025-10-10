# Backend Deployment and CORS Configuration

## Overview
This document explains how to properly configure your backend for deployment with correct CORS settings to allow frontend connections.

## CORS Configuration

### Development Environment
During development, your frontend typically runs on:
- `http://localhost:5173`
- `http://localhost:5174` (if 5173 is busy)
- `http://localhost:5175` (if others are busy)

The backend is configured to allow these origins by default.

### Production Environment
For production deployment, you need to specify the allowed origins:
- Your Netlify frontend: `https://colabie.netlify.app`
- Any other domains where your frontend might be hosted

### Environment Variables

#### CORS_ORIGIN
- **Purpose**: Comma-separated list of allowed origins
- **Development default**: `http://localhost:5173,http://localhost:5174,http://localhost:5175`
- **Production example**: `https://colabie.netlify.app,https://your-custom-domain.com`

## Deployment Configuration

### Render Deployment
1. Set environment variables in Render dashboard:
   ```
   MONGO_URI=your-mongodb-connection-string
   JWT_ACCESS_SECRET=your-super-secret-jwt-key
   CORS_ORIGIN=https://colabie.netlify.app
   ```

2. Render will automatically use PORT 3001

### Railway Deployment
1. Set environment variables in Railway dashboard:
   ```
   MONGO_URI=your-mongodb-connection-string
   JWT_ACCESS_SECRET=your-super-secret-jwt-key
   CORS_ORIGIN=https://colabie.netlify.app
   ```

### Vercel Deployment
1. Set environment variables in Vercel dashboard:
   ```
   MONGO_URI=your-mongodb-connection-string
   JWT_ACCESS_SECRET=your-super-secret-jwt-key
   CORS_ORIGIN=https://colabie.netlify.app
   ```

## Troubleshooting CORS Issues

### 1. Check Environment Variables
Ensure `CORS_ORIGIN` is set correctly in your deployment platform.

### 2. Verify Frontend Domain
Make sure your frontend domain is included in the `CORS_ORIGIN` list.

### 3. Check Headers
The backend should include these headers in responses:
- `Access-Control-Allow-Origin`
- `Access-Control-Allow-Credentials`
- `Access-Control-Allow-Methods`
- `Access-Control-Allow-Headers`

### 4. Socket.IO CORS
Socket.IO connections also need proper CORS configuration:
```javascript
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
        methods: ["GET", "POST"],
        credentials: true
    }
});
```

## Testing CORS Configuration

### 1. Health Check
```
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://your-backend-url.com/api/health
```

### 2. API Test
```
curl -H "Origin: http://localhost:5173" \
     https://your-backend-url.com/api/health
```

Look for `access-control-allow-origin` header in the response.

## Common Issues and Solutions

### Issue: No 'Access-Control-Allow-Origin' header
**Solution**: 
1. Check that `CORS_ORIGIN` environment variable is set
2. Verify the origin is in the allowed list
3. Restart your backend service

### Issue: Credentials not allowed
**Solution**:
1. Ensure `credentials: true` is set in both Express CORS and Socket.IO CORS
2. Make sure frontend is sending credentials with requests

### Issue: Preflight request failed
**Solution**:
1. Check that all required CORS headers are being set
2. Verify allowed methods include the HTTP methods you're using
3. Ensure allowed headers include the headers you're sending