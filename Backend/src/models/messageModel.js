import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chatId: { 
    type: String,
    required: true 
  },
  senderId: { 
    type: String,
    required: true 
  },
  content: {
    type: String,
    required: true 
  },
  messageType: { 
    type: String, 
    enum: ['text', 'image', 'video', 'file'], 
    default: 'text' 
  },
  read: {
    type: Boolean,
    default: false
  }
}, 
{ 
  timestamps: true 
});

const Message = mongoose.model('Message', messageSchema);

export default Message;     