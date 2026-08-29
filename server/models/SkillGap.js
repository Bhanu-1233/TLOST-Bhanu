import mongoose from 'mongoose';

const skillGapSchema = new mongoose.Schema({
  traineeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainee',
    required: true,
  },
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingProgram',
  },
  programName: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: [
      'Communication & Soft Skills',
      'Technical Proficiency',
      'Problem Solving & Critical Thinking',
      'Workplace Readiness & Teamwork',
      'Domain Knowledge & Compliance',
      'Tool & Technology Stack',
    ],
    required: true,
  },
  skill: {
    type: String,
    required: true,
    trim: true,
  },
  severity: {
    type: String,
    enum: ['minor', 'moderate', 'critical'],
    default: 'moderate',
  },
  source: {
    type: String,
    enum: ['employer_validation', 'follow_up', 'provider_review'],
    default: 'employer_validation',
  },
  reportedBy: {
    type: String,
    default: 'Employer Feedback',
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

export const SkillGap = mongoose.model('SkillGap', skillGapSchema);
