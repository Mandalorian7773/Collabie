import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['text', 'board', 'voice']
    },
    serverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Server',
        required: true
    },
    // For text channels, we'll reference messages
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }]
}, {
    timestamps: true
});

// Index for faster queries
channelSchema.index({ serverId: 1 });
channelSchema.index({ type: 1 });

// Pre-save middleware to ensure text channels have messages array
channelSchema.pre('save', function(next) {
    if (this.type === 'text' && !this.messages) {
        this.messages = [];
    }
    next();
});

// Static method to find channels by server ID
channelSchema.statics.findByServerId = function(serverId) {
    return this.find({ serverId });
};

// Static method to find channel by ID and populate server
channelSchema.statics.findByIdWithServer = function(id) {
    return this.findById(id).populate('serverId');
};

const Channel = mongoose.model('Channel', channelSchema);

export default Channel;