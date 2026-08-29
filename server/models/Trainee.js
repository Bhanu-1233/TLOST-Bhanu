import mongoose from 'mongoose';

const currentOutcomeSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['employed', 'self_employed', 'apprentice', 'seeking_work', 'further_education', 'unavailable', 'other'],
    default: 'seeking_work',
  },
  employerName: { type: String, default: '' },
  employerEmail: { type: String, default: '' },
  roleTitle: { type: String, default: '' },
  joiningDate: { type: Date },
  employmentType: {
    type: String,
    enum: ['full_time', 'part_time', 'contract', 'freelance', 'internship', 'none'],
    default: 'none',
  },
  wageBand: {
    type: String,
    enum: ['< $25k', '$25k-$40k', '$40k-$60k', '$60k-$80k', '$80k-$100k', '$100k+', 'not_disclosed'],
    default: 'not_disclosed',
  },
  verificationStatus: {
    type: String,
    enum: ['trainee_reported', 'employer_verified', 'rejected', 'not_verified'],
    default: 'not_verified',
  },
  lastReportedDate: { type: Date, default: Date.now },
}, { _id: false });

const traineeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    default: '',
  },
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingProgram',
  },
  programName: {
    type: String,
    default: '',
  },
  cohortName: {
    type: String,
    default: 'Cohort 2026-A',
  },
  enrollmentDate: {
    type: Date,
    default: Date.now,
  },
  completionDate: {
    type: Date,
  },
  trainingStatus: {
    type: String,
    enum: ['enrolled', 'completed', 'dropped'],
    default: 'enrolled',
  },
  currentOutcome: {
    type: currentOutcomeSchema,
    default: () => ({}),
  },
}, {
  timestamps: true,
});

export const Trainee = mongoose.model('Trainee', traineeSchema);
