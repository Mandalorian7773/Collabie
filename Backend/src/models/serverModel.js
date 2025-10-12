import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const serverSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['owner', 'admin', 'member'],
            default: 'member'
        }
    }],
    channels: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel'
    }],
    inviteCode: {
        type: String,
        unique: true,
        default: () => uuidv4()
    }
}, {
    timestamps: true
});

// Index for faster queries
serverSchema.index({ inviteCode: 1 });
serverSchema.index({ owner: 1 });

// Ensure owner is also a member with owner role
serverSchema.pre('save', function(next) {
    // Check if owner is already in members array
    const ownerExists = this.members.some(member => 
        member.userId.toString() === this.owner.toString()
    );
    
    // If not, add owner as a member with owner role
    if (!ownerExists) {
        this.members.push({
            userId: this.owner,
            role: 'owner'
        });
    }
    
    next();
});

// Method to add a member to the server
serverSchema.methods.addMember = function(userId, role = 'member') {
    // Check if user is already a member
    const isMember = this.members.some(member => 
        member.userId.toString() === userId.toString()
    );
    
    if (!isMember) {
        this.members.push({
            userId,
            role
        });
        return this.save();
    }
    return this;
};

// Method to remove a member from the server
serverSchema.methods.removeMember = function(userId) {
    this.members = this.members.filter(member => 
        member.userId.toString() !== userId.toString()
    );
    return this.save();
};

// Method to update a member's role
serverSchema.methods.updateMemberRole = function(userId, role) {
    const member = this.members.find(member => 
        member.userId.toString() === userId.toString()
    );
    
    if (member) {
        member.role = role;
        return this.save();
    }
    throw new Error('Member not found');
};

// Method to generate a new invite code
serverSchema.methods.generateInviteCode = function() {
    this.inviteCode = uuidv4();
    return this.save();
};

// Static method to find servers by user ID
serverSchema.statics.findByUserId = function(userId) {
    return this.find({
        'members.userId': userId
    }).populate('owner', 'username email avatar role')
      .populate('members.userId', 'username email avatar role');

};

// Static method to find server by invite code
serverSchema.statics.findByInviteCode = function(inviteCode) {
    return this.findOne({ inviteCode })
      .populate('owner', 'username email avatar role')
      .populate('members.userId', 'username email avatar role');
};

const Server = mongoose.model('Server', serverSchema);

export default Server;