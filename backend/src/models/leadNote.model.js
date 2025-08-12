
import mongoose from 'mongoose';

const leadNoteSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for efficient querying
leadNoteSchema.index({ leadId: 1, createdAt: -1 });
leadNoteSchema.index({ userId: 1 });

export default mongoose.model('LeadNote', leadNoteSchema);
