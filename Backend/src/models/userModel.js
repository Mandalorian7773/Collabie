import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [30, 'Username cannot exceed 30 characters'],
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },
    avatar: {
        type: String,
        default: '',
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'moderator', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    profileSetup: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});


userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ lastActive: -1 });
userSchema.index({ role: 1 });


userSchema.virtual('displayName').get(function() {
    return this.username || this.email.split('@')[0];
});


userSchema.pre('save', async function(next) {

    if (!this.isModified('password')) return next();

    try {

        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});


userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};


userSchema.methods.updateLastActive = function() {
    this.lastActive = new Date();
    return this.save({ validateBeforeSave: false });
};


userSchema.statics.getActiveUsers = function() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return this.find({
        lastActive: { $gte: yesterday },
        isActive: true
    }).select('username email avatar role lastActive');
};


userSchema.statics.findByEmailOrUsername = function(identifier) {
    return this.findOne({
        $or: [
            { email: identifier },
            { username: identifier }
        ]
    }).select('+password');
};


userSchema.methods.getPublicProfile = function() {
    return {
        _id: this._id,
        username: this.username,
        email: this.email,
        avatar: this.avatar,
        role: this.role,
        isActive: this.isActive,
        lastActive: this.lastActive,
        emailVerified: this.emailVerified,
        profileSetup: this.profileSetup,
        createdAt: this.createdAt,
        displayName: this.displayName
    };
};


userSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
    }
});

const User = mongoose.model('User', userSchema);

export default User;