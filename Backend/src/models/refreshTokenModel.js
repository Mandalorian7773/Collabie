import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }
    },
    isRevoked: {
        type: Boolean,
        default: false
    },
    deviceInfo: {
        userAgent: String,
        ip: String,
        device: String
    },
    lastUsed: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});


refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ token: 1 });
refreshTokenSchema.index({ expiresAt: 1 });
refreshTokenSchema.index({ isRevoked: 1 });


refreshTokenSchema.statics.cleanupTokens = async function() {
    const result = await this.deleteMany({
        $or: [
            { expiresAt: { $lte: new Date() } },
            { isRevoked: true }
        ]
    });
    console.log(`Cleaned up ${result.deletedCount} expired/revoked refresh tokens`);
    return result;
};


refreshTokenSchema.statics.revokeAllForUser = async function(userId) {
    const result = await this.updateMany(
        { userId, isRevoked: false },
        { isRevoked: true }
    );
    console.log(`Revoked ${result.modifiedCount} refresh tokens for user ${userId}`);
    return result;
};


refreshTokenSchema.statics.revokeToken = async function(tokenString) {
    const result = await this.updateOne(
        { token: tokenString, isRevoked: false },
        { isRevoked: true }
    );
    return result.modifiedCount > 0;
};


refreshTokenSchema.methods.isValid = function() {
    return !this.isRevoked && this.expiresAt > new Date();
};


refreshTokenSchema.methods.markAsUsed = function() {
    this.lastUsed = new Date();
    return this.save();
};


refreshTokenSchema.statics.findValidToken = function(tokenString) {
    return this.findOne({
        token: tokenString,
        isRevoked: false,
        expiresAt: { $gt: new Date() }
    }).populate('userId', 'username email role isActive');
};


refreshTokenSchema.statics.createToken = async function(userId, tokenString, expiresAt, deviceInfo = {}) {

    const tokenCount = await this.countDocuments({ userId, isRevoked: false });
    if (tokenCount >= 5) {

        const oldestToken = await this.findOne({ userId, isRevoked: false }).sort({ createdAt: 1 });
        if (oldestToken) {
            oldestToken.isRevoked = true;
            await oldestToken.save();
        }
    }

    return this.create({
        token: tokenString,
        userId,
        expiresAt,
        deviceInfo
    });
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

export default RefreshToken;