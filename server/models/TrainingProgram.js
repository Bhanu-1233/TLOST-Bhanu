import mongoose from 'mongoose';

const cohortSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  startDate: { type: Date, default: Date.now },
  completionDate: { type: Date },
  active: { type: Boolean, default: true },
});

const trainingProgramSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  providerName: {
    type: String,
    default: 'Global Tech Academy',
  },
  skillArea: {
    type: String,
    required: true,
  },
  durationWeeks: {
    type: Number,
    default: 12,
  },
  description: {
    type: String,
    default: '',
  },
  cohorts: [cohortSchema],
}, {
  timestamps: true,
});

export const TrainingProgram = mongoose.model('TrainingProgram', trainingProgramSchema);
