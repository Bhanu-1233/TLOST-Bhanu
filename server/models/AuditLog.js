import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  actorId: {
    type: String,
    default: 'system',
  },
  actorName: {
    type: String,
    default: 'System',
  },
  actorRole: {
    type: String,
    default: 'system',
  },
  action: {
    type: String,
    required: true,
  },
  resourceType: {
    type: String,
    required: true,
  },
  resourceId: {
    type: String,
    default: '',
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({}),
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: false,
});

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
