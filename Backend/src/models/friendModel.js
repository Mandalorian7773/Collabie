import mongoose from 'mongoose';

const friendSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'blocked'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Ensure unique friendship pairs
friendSchema.index({ requester: 1, recipient: 1 }, { unique: true });
friendSchema.index({ recipient: 1, status: 1 });
friendSchema.index({ requester: 1, status: 1 });

// Prevent users from being friends with themselves
friendSchema.pre('save', function(next) {
    if (this.requester.equals(this.recipient)) {
        return next(new Error('Users cannot be friends with themselves'));
    }
    next();
});

// Method to accept a friend request
friendSchema.methods.accept = function() {
    this.status = 'accepted';
    this.updatedAt = new Date();
    return this.save();
};

// Method to decline a friend request
friendSchema.methods.decline = function() {
    this.status = 'declined';
    this.updatedAt = new Date();
    return this.save();
};

// Method to block a friend
friendSchema.methods.block = function() {
    this.status = 'blocked';
    this.updatedAt = new Date();
    return this.save();
};

// Static method to find friends for a user
friendSchema.statics.getFriends = function(userId) {
    return this.find({
        $or: [
            { requester: userId },
            { recipient: userId }
        ],
        status: 'accepted'
    }).populate('requester recipient', 'username email avatar role lastActive');
};

// Static method to find pending friend requests for a user
friendSchema.statics.getPendingRequests = function(userId) {
    return this.find({
        recipient: userId,
        status: 'pending'
    }).populate('requester', 'username email avatar role lastActive');
};

// Static method to check if two users are friends
friendSchema.statics.areFriends = function(userId1, userId2) {
    return this.findOne({
        $or: [
            { requester: userId1, recipient: userId2 },
            { requester: userId2, recipient: userId1 }
        ],
        status: 'accepted'
    });
};

const Friend = mongoose.model('Friend', friendSchema);

export default Friend;