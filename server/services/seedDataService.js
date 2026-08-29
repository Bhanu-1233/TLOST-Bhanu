import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { TrainingProgram } from '../models/TrainingProgram.js';
import { Trainee } from '../models/Trainee.js';
import { Consent } from '../models/Consent.js';
import { EmploymentRecord } from '../models/EmploymentRecord.js';
import { FollowUp } from '../models/FollowUp.js';
import { ValidationRequest } from '../models/ValidationRequest.js';
import { SkillGap } from '../models/SkillGap.js';
import { AuditLog } from '../models/AuditLog.js';

export const seedDatabase = async (force = false) => {
  const userCount = await User.countDocuments();
  if (userCount > 0 && !force) {
    console.log('Database already contains records. Skipping initial seeding.');
    return { success: true, message: 'Database already populated.' };
  }

  console.log('Clearing old collections and seeding full synthetic dataset...');
  await Promise.all([
    User.deleteMany({}),
    TrainingProgram.deleteMany({}),
    Trainee.deleteMany({}),
    Consent.deleteMany({}),
    EmploymentRecord.deleteMany({}),
    FollowUp.deleteMany({}),
    ValidationRequest.deleteMany({}),
    SkillGap.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // 1. Create Core Users for each role
  const adminUser = await User.create({
    name: 'Sarah Connor (Admin)',
    email: 'admin@example.com',
    passwordHash: defaultPasswordHash,
    role: 'admin',
    organization: 'National Outcome Verification Directorate',
    status: 'active',
  });

  const providerUser = await User.create({
    name: 'Elena Rostova (Provider)',
    email: 'provider@example.com',
    passwordHash: defaultPasswordHash,
    role: 'training_provider',
    organization: 'Apex Vocational & Tech Institute',
    status: 'active',
  });

  const employerUser = await User.create({
    name: 'Marcus Vance (Employer)',
    email: 'employer@example.com',
    passwordHash: defaultPasswordHash,
    role: 'employer',
    organization: 'CloudScale Dynamics Inc.',
    status: 'active',
  });

  const traineeUser = await User.create({
    name: 'Alex Rivera (Trainee)',
    email: 'trainee@example.com',
    passwordHash: defaultPasswordHash,
    role: 'trainee',
    organization: 'Apex Vocational & Tech Institute',
    status: 'active',
  });

  // 2. Create 3 Training Programs with 5 Cohorts
  const programData = [
    {
      name: 'Full Stack Web & Cloud Engineering',
      code: 'FSW-2026',
      providerId: providerUser._id,
      providerName: 'Apex Vocational & Tech Institute',
      skillArea: 'Software Development & Cloud',
      durationWeeks: 16,
      description: 'Comprehensive frontend (React/Tailwind), backend (Node/Express/MongoDB), DevOps CI/CD, and Cloud deployment curriculum.',
      cohorts: [
        { name: 'Cohort Alpha 2025-Q3', code: 'FSW-C1', startDate: new Date('2025-07-01'), completionDate: new Date('2025-10-25'), active: false },
        { name: 'Cohort Beta 2025-Q4', code: 'FSW-C2', startDate: new Date('2025-10-01'), completionDate: new Date('2026-01-20'), active: false },
        { name: 'Cohort Gamma 2026-Q1', code: 'FSW-C3', startDate: new Date('2026-02-01'), completionDate: new Date('2026-05-25'), active: true },
      ],
    },
    {
      name: 'Data Analytics & Business Intelligence',
      code: 'DABI-2026',
      providerId: providerUser._id,
      providerName: 'Apex Vocational & Tech Institute',
      skillArea: 'Data Science & BI',
      durationWeeks: 12,
      description: 'SQL mastery, Python data analysis, PowerBI visualization, and statistical modeling for enterprise decision making.',
      cohorts: [
        { name: 'Cohort Data-1 2025', code: 'DABI-C1', startDate: new Date('2025-08-15'), completionDate: new Date('2025-11-10'), active: false },
        { name: 'Cohort Data-2 2026', code: 'DABI-C2', startDate: new Date('2026-01-10'), completionDate: new Date('2026-04-10'), active: true },
      ],
    },
    {
      name: 'Cybersecurity Operations & Network Defense',
      code: 'CYBER-2026',
      providerId: providerUser._id,
      providerName: 'Apex Vocational & Tech Institute',
      skillArea: 'Cybersecurity & Infrastructure',
      durationWeeks: 14,
      description: 'Hands-on SOC operations, network packet inspection, threat hunting, vulnerability management, and incident response.',
      cohorts: [
        { name: 'Cohort Cyber-Alpha', code: 'CYB-C1', startDate: new Date('2025-09-01'), completionDate: new Date('2025-12-15'), active: false },
      ],
    },
  ];

  const createdPrograms = await TrainingProgram.insertMany(programData);

  // 3. Create Synthetic Trainees with Diverse Outcomes
  const syntheticTrainees = [
    {
      name: 'Alex Rivera',
      email: 'trainee@example.com',
      userId: traineeUser._id,
      phone: '+1 (555) 234-5678',
      programId: createdPrograms[0]._id,
      programName: createdPrograms[0].name,
      cohortName: 'Cohort Alpha 2025-Q3',
      enrollmentDate: new Date('2025-07-01'),
      completionDate: new Date('2025-10-25'),
      trainingStatus: 'completed',
      currentOutcome: {
        category: 'employed',
        employerName: 'CloudScale Dynamics Inc.',
        employerEmail: 'employer@example.com',
        roleTitle: 'Junior Full Stack Engineer',
        joiningDate: new Date('2025-11-15'),
        employmentType: 'full_time',
        wageBand: '$60k-$80k',
        verificationStatus: 'employer_verified',
        lastReportedDate: new Date('2026-02-15'),
      },
    },
    {
      name: 'Jordan Hayes',
      email: 'jordan.hayes@example.org',
      phone: '+1 (555) 345-6789',
      programId: createdPrograms[0]._id,
      programName: createdPrograms[0].name,
      cohortName: 'Cohort Alpha 2025-Q3',
      enrollmentDate: new Date('2025-07-01'),
      completionDate: new Date('2025-10-25'),
      trainingStatus: 'completed',
      currentOutcome: {
        category: 'employed',
        employerName: 'NextGen Fintech Labs',
        employerEmail: 'hr@nextgenfintech.io',
        roleTitle: 'Frontend React Developer',
        joiningDate: new Date('2025-12-01'),
        employmentType: 'full_time',
        wageBand: '$60k-$80k',
        verificationStatus: 'employer_verified',
        lastReportedDate: new Date('2026-01-28'),
      },
    },
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@example.org',
      phone: '+1 (555) 456-7890',
      programId: createdPrograms[0]._id,
      programName: createdPrograms[0].name,
      cohortName: 'Cohort Beta 2025-Q4',
      enrollmentDate: new Date('2025-10-01'),
      completionDate: new Date('2026-01-20'),
      trainingStatus: 'completed',
      currentOutcome: {
        category: 'self_employed',
        employerName: 'Priya Web Solutions (Freelance)',
        roleTitle: 'Independent Web Consultant',
        joiningDate: new Date('2026-02-01'),
        employmentType: 'freelance',
        wageBand: '$40k-$60k',
        verificationStatus: 'trainee_reported',
        lastReportedDate: new Date('2026-02-20'),
      },
    },
    {
      name: 'Devon Miller',
      email: 'devon.miller@example.org',
      phone: '+1 (555) 567-8901',
      programId: createdPrograms[1]._id,
      programName: createdPrograms[1].name,
      cohortName: 'Cohort Data-1 2025',
      enrollmentDate: new Date('2025-08-15'),
      completionDate: new Date('2025-11-10'),
      trainingStatus: 'completed',
      currentOutcome: {
        category: 'apprentice',
        employerName: 'Metro Health Analytics',
        employerEmail: 'analytics@metrohealth.org',
        roleTitle: 'Data Analyst Apprentice',
        joiningDate: new Date('2025-11-20'),
        employmentType: 'contract',
        wageBand: '$40k-$60k',
        verificationStatus: 'employer_verified',
        lastReportedDate: new Date('2026-02-10'),
      },
    },
    {
      name: 'Liam Zhang',
      email: 'liam.zhang@example.org',
      phone: '+1 (555) 678-9012',
      programId: createdPrograms[1]._id,
      programName: createdPrograms[1].name,
      cohortName: 'Cohort Data-1 2025',
      enrollmentDate: new Date('2025-08-15'),
      completionDate: new Date('2025-11-10'),
      trainingStatus: 'completed',
      currentOutcome: {
        category: 'employed',
        employerName: 'RetailInsights Global',
        employerEmail: 'careers@retailinsights.com',
        roleTitle: 'BI Reporting Specialist',
        joiningDate: new Date('2025-12-10'),
        employmentType: 'full_time',
        wageBand: '$80k-$100k',
        verificationStatus: 'trainee_reported',
        lastReportedDate: new Date('2026-01-15'),
      },
    },
    {
      name: 'Maya Patel',
      email: 'maya.patel@example.org',
      phone: '+1 (555) 789-0123',
      programId: createdPrograms[2]._id,
      programName: createdPrograms[2].name,
      cohortName: 'Cohort Cyber-Alpha',
      enrollmentDate: new Date('2025-09-01'),
      completionDate: new Date('2025-12-15'),
      trainingStatus: 'completed',
      currentOutcome: {
        category: 'employed',
        employerName: 'SecureShield Systems',
        employerEmail: 'soc@secureshield.net',
        roleTitle: 'SOC Tier 1 Analyst',
        joiningDate: new Date('2026-01-05'),
        employmentType: 'full_time',
        wageBand: '$60k-$80k',
        verificationStatus: 'employer_verified',
        lastReportedDate: new Date('2026-02-25'),
      },
    },
    {
      name: 'Carlos Gomez',
      email: 'carlos.gomez@example.org',
      phone: '+1 (555) 890-1234',
      programId: createdPrograms[0]._id,
      programName: createdPrograms[0].name,
      cohortName: 'Cohort Beta 2025-Q4',
      enrollmentDate: new Date('2025-10-01'),
      completionDate: new Date('2026-01-20'),
      trainingStatus: 'completed',
      currentOutcome: {
        category: 'seeking_work',
        roleTitle: 'Junior Developer (Actively Interviewing)',
        wageBand: 'not_disclosed',
        verificationStatus: 'not_verified',
        lastReportedDate: new Date('2026-02-15'),
      },
    },
    {
      name: 'Samantha Brooks',
      email: 'samantha.brooks@example.org',
      phone: '+1 (555) 901-2345',
      programId: createdPrograms[0]._id,
      programName: createdPrograms[0].name,
      cohortName: 'Cohort Gamma 2026-Q1',
      enrollmentDate: new Date('2026-02-01'),
      trainingStatus: 'enrolled',
      currentOutcome: {
        category: 'seeking_work',
        verificationStatus: 'not_verified',
      },
    },
    {
      name: 'Tariq Al-Mansoor',
      email: 'tariq.mansoor@example.org',
      phone: '+1 (555) 012-3456',
      programId: createdPrograms[1]._id,
      programName: createdPrograms[1].name,
      cohortName: 'Cohort Data-2 2026',
      enrollmentDate: new Date('2026-01-10'),
      trainingStatus: 'enrolled',
      currentOutcome: {
        category: 'seeking_work',
        verificationStatus: 'not_verified',
      },
    },
    {
      name: 'Hannah Abbott',
      email: 'hannah.abbott@example.org',
      phone: '+1 (555) 123-9876',
      programId: createdPrograms[0]._id,
      programName: createdPrograms[0].name,
      cohortName: 'Cohort Alpha 2025-Q3',
      enrollmentDate: new Date('2025-07-01'),
      completionDate: new Date('2025-10-25'),
      trainingStatus: 'completed',
      currentOutcome: {
        category: 'further_education',
        roleTitle: 'Computer Science B.S. Degree Transition',
        wageBand: 'not_disclosed',
        verificationStatus: 'trainee_reported',
        lastReportedDate: new Date('2026-01-10'),
      },
    }
  ];

  const createdTrainees = await Trainee.insertMany(syntheticTrainees);

  // 4. Create Consents for all trainees
  for (const trainee of createdTrainees) {
    await Consent.create({
      traineeId: trainee._id,
      userId: trainee.userId || null,
      status: 'granted',
      version: '1.0',
      purpose: 'Consent for longitudinal outcome tracking, 30/90/180-day micro-surveys, and employer validation under privacy policies.',
      givenAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      history: [
        { action: 'granted', version: '1.0', timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), notes: 'Initial enrollment consent accepted' }
      ]
    });
  }

  // 5. Create Preserved Employment History Snapshots (Section 14)
  const alexTrainee = createdTrainees.find(t => t.email === 'trainee@example.com');
  if (alexTrainee) {
    // Initial placement record
    const rec1 = await EmploymentRecord.create({
      traineeId: alexTrainee._id,
      category: 'employed',
      employerId: employerUser._id,
      employerName: 'CloudScale Dynamics Inc.',
      employerEmail: 'employer@example.com',
      roleTitle: 'Junior Software Engineer Intern',
      joiningDate: new Date('2025-11-15'),
      employmentType: 'full_time',
      wageBand: '$40k-$60k',
      checkpoint: '30_day',
      source: 'trainee_reported',
      verificationStatus: 'employer_verified',
      verifiedAt: new Date('2025-12-20'),
      verifiedBy: 'Marcus Vance (Employer)',
      notes: 'Initial hiring confirmed during 30-day checkpoint.',
      recordedAt: new Date('2025-11-15'),
    });

    // Progression snapshot at 90 days (Wage band increased!)
    const rec2 = await EmploymentRecord.create({
      traineeId: alexTrainee._id,
      category: 'employed',
      employerId: employerUser._id,
      employerName: 'CloudScale Dynamics Inc.',
      employerEmail: 'employer@example.com',
      roleTitle: 'Junior Full Stack Engineer (Promoted)',
      joiningDate: new Date('2025-11-15'),
      employmentType: 'full_time',
      wageBand: '$60k-$80k',
      checkpoint: '90_day',
      source: 'trainee_reported',
      verificationStatus: 'employer_verified',
      verifiedAt: new Date('2026-02-15'),
      verifiedBy: 'Marcus Vance (Employer)',
      notes: 'Promoted to regular engineer with wage band progression.',
      recordedAt: new Date('2026-02-10'),
    });

    // Validation Request for Alex
    const sampleToken = 'demo-validation-token-cloudscale-2026';
    const sampleTokenHash = crypto.createHash('sha256').update(sampleToken).digest('hex');
    
    await ValidationRequest.create({
      traineeId: alexTrainee._id,
      employmentRecordId: rec2._id,
      requestedByProviderId: providerUser._id,
      employerEmail: 'employer@example.com',
      employerName: 'CloudScale Dynamics Inc.',
      token: sampleToken,
      tokenHash: sampleTokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'completed',
      completedAt: new Date('2026-02-15'),
      feedback: {
        confirmed: true,
        roleConfirmed: true,
        startDateConfirmed: true,
        wageBandConfirmed: true,
        performanceRating: 'exceptional',
        comments: 'Alex is performing brilliantly on React & Express services. Excellent team contributor.',
        skillGapsIdentified: ['Communication & Soft Skills', 'Tool & Technology Stack'],
      },
    });

    // Pending Validation Request for another trainee to test verification flow
    const jordanTrainee = createdTrainees.find(t => t.name === 'Jordan Hayes');
    if (jordanTrainee) {
      const jordanRec = await EmploymentRecord.create({
        traineeId: jordanTrainee._id,
        category: 'employed',
        employerName: 'NextGen Fintech Labs',
        employerEmail: 'hr@nextgenfintech.io',
        roleTitle: 'Frontend React Developer',
        joiningDate: new Date('2025-12-01'),
        employmentType: 'full_time',
        wageBand: '$60k-$80k',
        checkpoint: '30_day',
        source: 'trainee_reported',
        verificationStatus: 'trainee_reported',
        notes: 'Pending employer confirmation.',
        recordedAt: new Date('2026-01-05'),
      });

      const pendingToken = 'verify-token-jordan-nextgen-8899';
      await ValidationRequest.create({
        traineeId: jordanTrainee._id,
        employmentRecordId: jordanRec._id,
        requestedByProviderId: providerUser._id,
        employerEmail: 'hr@nextgenfintech.io',
        employerName: 'NextGen Fintech Labs',
        token: pendingToken,
        tokenHash: crypto.createHash('sha256').update(pendingToken).digest('hex'),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'pending',
      });
    }
  }

  // 6. Create Follow-up Checkpoints (30, 90, 180-day)
  for (const trainee of createdTrainees.filter(t => t.trainingStatus === 'completed')) {
    // 30-day
    await FollowUp.create({
      traineeId: trainee._id,
      userId: trainee.userId || null,
      checkpointType: '30_day',
      scheduledAt: new Date(trainee.completionDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      sentAt: new Date(trainee.completionDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      completedAt: new Date(trainee.completionDate.getTime() + 32 * 24 * 60 * 60 * 1000),
      status: 'completed',
      responses: {
        working: trainee.currentOutcome.category === 'employed' || trainee.currentOutcome.category === 'self_employed' || trainee.currentOutcome.category === 'apprentice',
        outcomeCategory: trainee.currentOutcome.category,
        employerName: trainee.currentOutcome.employerName,
        roleTitle: trainee.currentOutcome.roleTitle,
        wageBand: trainee.currentOutcome.wageBand,
        retentionStatus: 'still_employed',
        supportNeeded: false,
        skillTrainingNeed: 'Advanced Docker and TypeScript',
        futurePlans: 'Gain deeper AWS certifications',
      },
    });

    // 90-day
    await FollowUp.create({
      traineeId: trainee._id,
      userId: trainee.userId || null,
      checkpointType: '90_day',
      scheduledAt: new Date(trainee.completionDate.getTime() + 90 * 24 * 60 * 60 * 1000),
      sentAt: new Date(trainee.completionDate.getTime() + 90 * 24 * 60 * 60 * 1000),
      completedAt: trainee.name === 'Alex Rivera' ? new Date(trainee.completionDate.getTime() + 92 * 24 * 60 * 60 * 1000) : null,
      status: trainee.name === 'Alex Rivera' ? 'completed' : 'sent',
      responses: trainee.name === 'Alex Rivera' ? {
        working: true,
        outcomeCategory: 'employed',
        employerName: 'CloudScale Dynamics Inc.',
        roleTitle: 'Junior Full Stack Engineer',
        wageBand: '$60k-$80k',
        retentionStatus: 'promoted',
        supportNeeded: false,
        skillTrainingNeed: 'System Design Patterns',
        futurePlans: 'Lead microservice refactoring team',
      } : {},
    });

    // 180-day
    await FollowUp.create({
      traineeId: trainee._id,
      userId: trainee.userId || null,
      checkpointType: '180_day',
      scheduledAt: new Date(trainee.completionDate.getTime() + 180 * 24 * 60 * 60 * 1000),
      status: 'scheduled',
    });
  }

  // 7. Create Structured Skill Gaps
  const sampleSkillGaps = [
    {
      traineeId: alexTrainee._id,
      programId: createdPrograms[0]._id,
      programName: createdPrograms[0].name,
      category: 'Communication & Soft Skills',
      skill: 'Stakeholder Status Presentation',
      severity: 'moderate',
      source: 'employer_validation',
      reportedBy: 'Marcus Vance (Employer)',
      notes: 'Needs slightly more confidence articulating technical architecture in cross-functional syncs.',
    },
    {
      traineeId: alexTrainee._id,
      programId: createdPrograms[0]._id,
      programName: createdPrograms[0].name,
      category: 'Tool & Technology Stack',
      skill: 'Docker Compose & Container Networking',
      severity: 'minor',
      source: 'employer_validation',
      reportedBy: 'Marcus Vance (Employer)',
      notes: 'Good fundamentals, benefits from deeper hands-on microservices networking practice.',
    },
    {
      traineeId: createdTrainees[1]._id,
      programId: createdPrograms[0]._id,
      programName: createdPrograms[0].name,
      category: 'Communication & Soft Skills',
      skill: 'Agile Estimation & Standup Communication',
      severity: 'moderate',
      source: 'provider_review',
      reportedBy: 'Elena Rostova (Provider)',
      notes: 'Feedback indicates sprint estimates can be improved through structured scoping.',
    },
    {
      traineeId: createdTrainees[3]._id,
      programId: createdPrograms[1]._id,
      programName: createdPrograms[1].name,
      category: 'Technical Proficiency',
      skill: 'Advanced SQL Window Functions',
      severity: 'moderate',
      source: 'employer_validation',
      reportedBy: 'Metro Health Analytics',
      notes: 'Suggested additional focus on complex aggregations and partition queries.',
    },
    {
      traineeId: createdTrainees[5]._id,
      programId: createdPrograms[2]._id,
      programName: createdPrograms[2].name,
      category: 'Domain Knowledge & Compliance',
      skill: 'SOC Incident Escalation Protocols',
      severity: 'minor',
      source: 'employer_validation',
      reportedBy: 'SecureShield Systems',
      notes: 'Strong alert triage speed; familiarize further with ISO 27001 ticketing workflows.',
    },
  ];

  await SkillGap.insertMany(sampleSkillGaps);

  // 8. Create Initial Audit Logs
  await AuditLog.create({
    actorId: adminUser._id.toString(),
    actorName: adminUser.name,
    actorRole: 'admin',
    action: 'SYSTEM_INITIALIZATION',
    resourceType: 'system',
    resourceId: 'init-seed',
    details: { message: 'Synthetic dataset populated with 3 programs, 5 cohorts, 10 trainees, and outcomes.' },
    ipAddress: '127.0.0.1',
  });

  console.log('Database seeded successfully!');
  return { success: true, message: 'Sample dataset seeded successfully.' };
};
