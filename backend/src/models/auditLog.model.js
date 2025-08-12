
import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  entity: {
    type: String,
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  oldValues: {
    type: mongoose.Schema.Types.Mixed
  },
  newValues: {
    type: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for efficient querying
auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ timestamp: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
