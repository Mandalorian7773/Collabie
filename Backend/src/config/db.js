import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database Name: ${conn.connection.name}`);
        
    } catch (error) {
        console.error('MongoDB Connection Error:', error.message);
        console.error('Please check your MONGO_URI environment variable');
        process.exit(1);
    }
};

export default connectDB;