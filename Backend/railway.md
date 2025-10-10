# Railway Deployment Configuration
# No config file needed - Railway auto-detects Node.js apps
# Just set environment variables in Railway dashboard:
# 
# Required Environment Variables:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/collabie
# JWT_ACCESS_SECRET=your-super-secret-jwt-key-for-production
# JWT_ACCESS_EXPIRES_IN=15m
# BCRYPT_SALT_ROUNDS=12
# NODE_ENV=production
# PORT=3001
#
# Railway will automatically:
# - Run "npm install"  
# - Run "npm start"
# - Provide a public URL
# - Handle SSL certificates