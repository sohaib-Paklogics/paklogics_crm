
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Email', 'SMS']
  },
  content: {
    type: String,
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  readStatus: {
    type: Boolean,
    default: false
  }
});

// Add indexes for efficient querying
notificationSchema.index({ userId: 1, sentAt: -1 });
notificationSchema.index({ status: 1 });

export default mongoose.model('Notification', notificationSchema);
