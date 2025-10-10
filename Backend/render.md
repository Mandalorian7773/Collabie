# Render Deployment Configuration

## Build Command
```
npm install
```

## Start Command  
```
npm start
```

## Required Environment Variables:
- MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/collabie
- JWT_ACCESS_SECRET=your-super-secret-jwt-key-for-production
- JWT_ACCESS_EXPIRES_IN=15m
- BCRYPT_SALT_ROUNDS=12
- NODE_ENV=production
- PORT=10000

## Health Check Path
```
/api/health
```

## Notes:
- Render assigns PORT automatically (usually 10000)
- MongoDB Atlas connection required
- Free tier has limitations but good for getting started