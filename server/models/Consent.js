import mongoose from 'mongoose';

const consentHistorySchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['granted', 'withdrawn', 'updated'],
    required: true,
  },
  version: {
    type: String,
    default: '1.0',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1',
  },
  notes: {
    type: String,
    default: '',
  },
}, { _id: false });

const consentSchema = new mongoose.Schema({
  traineeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainee',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['granted', 'withdrawn'],
    default: 'granted',
  },
  version: {
    type: String,
    default: '1.0',
  },
  purpose: {
    type: String,
    default: 'Post-training employment longitudinal tracking, outcome analysis, and employer validation under privacy-conscious data policies.',
  },
  givenAt: {
    type: Date,
    default: Date.now,
  },
  withdrawnAt: {
    type: Date,
  },
  history: [consentHistorySchema],
}, {
  timestamps: true,
});

export const Consent = mongoose.model('Consent', consentSchema);
