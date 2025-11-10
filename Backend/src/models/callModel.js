import mongoose from 'mongoose';

const callSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['voice', 'video'],
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    startedAt: {
        type: Date,
        default: Date.now
    },
    endedAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', 'ended', 'cancelled'],
        default: 'active'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    settings: {
        videoEnabled: {
            type: Boolean,
            default: true
        },
        audioEnabled: {
            type: Boolean,
            default: true
        },
        screenSharingEnabled: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});

// Index for querying active calls
callSchema.index({ roomId: 1, status: 1 });
callSchema.index({ participants: 1 });
callSchema.index({ createdBy: 1 });

// Virtual for call duration
callSchema.virtual('duration').get(function() {
    if (this.endedAt && this.startedAt) {
        return this.endedAt - this.startedAt;
    }
    if (this.startedAt) {
        return Date.now() - this.startedAt;
    }
    return 0;
});

// Method to end a call
callSchema.methods.endCall = function() {
    this.endedAt = new Date();
    this.status = 'ended';
    return this.save();
};

// Method to get active participants count
callSchema.virtual('activeParticipantsCount').get(function() {
    return this.participants.length;
});

// Static method to find active calls by room
callSchema.statics.findActiveCallsByRoom = function(roomId) {
    return this.find({ roomId, status: 'active' });
};

// Static method to find user's active calls
callSchema.statics.findActiveCallsByUser = function(userId) {
    return this.find({ 
        participants: userId, 
        status: 'active' 
    });
};

const Call = mongoose.model('Call', callSchema);

export default Call;