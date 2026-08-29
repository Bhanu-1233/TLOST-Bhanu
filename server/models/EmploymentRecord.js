import mongoose from 'mongoose';

const employmentRecordSchema = new mongoose.Schema({
  traineeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainee',
    required: true,
  },
  category: {
    type: String,
    enum: ['employed', 'self_employed', 'apprentice', 'seeking_work', 'further_education', 'unavailable', 'other'],
    required: true,
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  employerName: {
    type: String,
    default: '',
    trim: true,
  },
  employerEmail: {
    type: String,
    default: '',
    trim: true,
  },
  roleTitle: {
    type: String,
    default: '',
    trim: true,
  },
  joiningDate: {
    type: Date,
  },
  employmentType: {
    type: String,
    enum: ['full_time', 'part_time', 'contract', 'freelance', 'internship', 'none'],
    default: 'full_time',
  },
  wageBand: {
    type: String,
    enum: ['< $25k', '$25k-$40k', '$40k-$60k', '$60k-$80k', '$80k-$100k', '$100k+', 'not_disclosed'],
    default: 'not_disclosed',
  },
  checkpoint: {
    type: String,
    enum: ['initial', '30_day', '90_day', '180_day', 'ad_hoc'],
    default: 'ad_hoc',
  },
  source: {
    type: String,
    enum: ['trainee_reported', 'provider_reported', 'employer_sync'],
    default: 'trainee_reported',
  },
  verificationStatus: {
    type: String,
    enum: ['trainee_reported', 'employer_verified', 'rejected', 'not_verified'],
    default: 'trainee_reported',
  },
  verifiedAt: {
    type: Date,
  },
  verifiedBy: {
    type: String,
    default: '',
  },
  rejectionReason: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  recordedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export const EmploymentRecord = mongoose.model('EmploymentRecord', employmentRecordSchema);
