import mongoose from 'mongoose';

const followUpResponseSchema = new mongoose.Schema({
  working: { type: Boolean },
  outcomeCategory: { type: String },
  employerName: { type: String, default: '' },
  roleTitle: { type: String, default: '' },
  wageBand: { type: String, default: 'not_disclosed' },
  retentionStatus: { 
    type: String, 
    enum: ['still_employed', 'changed_employer', 'promoted', 'seeking_new_role', 'not_working', 'n/a'],
    default: 'n/a' 
  },
  supportNeeded: { type: Boolean, default: false },
  supportDetails: { type: String, default: '' },
  skillTrainingNeed: { type: String, default: '' },
  futurePlans: { type: String, default: '' },
}, { _id: false });

const followUpSchema = new mongoose.Schema({
  traineeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainee',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  checkpointType: {
    type: String,
    enum: ['30_day', '90_day', '180_day'],
    required: true,
  },
  scheduledAt: {
    type: Date,
    required: true,
  },
  sentAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['scheduled', 'sent', 'opened', 'completed', 'overdue'],
    default: 'scheduled',
  },
  responses: {
    type: followUpResponseSchema,
    default: () => ({}),
  },
}, {
  timestamps: true,
});

export const FollowUp = mongoose.model('FollowUp', followUpSchema);
