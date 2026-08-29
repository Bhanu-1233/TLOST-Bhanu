import mongoose from 'mongoose';

const validationFeedbackSchema = new mongoose.Schema({
  confirmed: { type: Boolean, default: true },
  roleConfirmed: { type: Boolean, default: true },
  startDateConfirmed: { type: Boolean, default: true },
  wageBandConfirmed: { type: Boolean, default: true },
  performanceRating: { type: String, enum: ['exceptional', 'satisfactory', 'needs_improvement', 'n/a'], default: 'satisfactory' },
  comments: { type: String, default: '' },
  skillGapsIdentified: [{ type: String }],
}, { _id: false });

const validationRequestSchema = new mongoose.Schema({
  traineeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainee',
    required: true,
  },
  employmentRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmploymentRecord',
    required: true,
  },
  requestedByProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  employerEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  employerName: {
    type: String,
    required: true,
    trim: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  tokenHash: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'rejected', 'expired'],
    default: 'pending',
  },
  completedAt: {
    type: Date,
  },
  feedback: {
    type: validationFeedbackSchema,
    default: () => ({}),
  },
}, {
  timestamps: true,
});

export const ValidationRequest = mongoose.model('ValidationRequest', validationRequestSchema);
