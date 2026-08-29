import { SkillGap } from '../models/SkillGap.js';
import { logAuditAction } from '../middleware/auditMiddleware.js';

export const getSkillTaxonomy = (req, res) => {
  const taxonomy = {
    'Communication & Soft Skills': [
      'Workplace Oral Communication',
      'Stakeholder Status Presentation',
      'Written Technical Documentation',
      'Agile Standup Communication',
      'Cross-functional Collaboration',
    ],
    'Technical Proficiency': [
      'Advanced SQL & Data Aggregations',
      'Full Stack API Integration',
      'State Management & Reactive UI',
      'Database Schema Normalization',
      'Debugging & Root Cause Analysis',
    ],
    'Problem Solving & Critical Thinking': [
      'System Architecture Decomposition',
      'Algorithm Optimization',
      'Self-directed Troubleshooting',
      'Requirement Ambiguity Resolution',
    ],
    'Workplace Readiness & Teamwork': [
      'Git Workflow & Merge Conflict Resolution',
      'Time Management & Deadline Adherence',
      'Constructive Code Review Participation',
      'Professional Initiative',
    ],
    'Domain Knowledge & Compliance': [
      'Industry Security Best Practices',
      'Data Privacy & GDPR/HIPAA Awareness',
      'SOC Incident Escalation Protocols',
      'Quality Assurance Standards',
    ],
    'Tool & Technology Stack': [
      'Docker & Containerization',
      'CI/CD Pipelines & GitHub Actions',
      'Cloud Services (AWS/GCP/Azure)',
      'Testing Frameworks (Jest/Cypress)',
      'Linux Shell Scripting',
    ],
  };

  res.json({ success: true, data: taxonomy });
};

export const getSkillGaps = async (req, res) => {
  try {
    const { programId, category, severity } = req.query;
    const filter = {};

    if (programId) filter.programId = programId;
    if (category) filter.category = category;
    if (severity) filter.severity = severity;

    const skillGaps = await SkillGap.find(filter)
      .populate('traineeId', 'name email cohortName currentOutcome')
      .sort({ recordedAt: -1 });

    res.json({ success: true, count: skillGaps.length, data: skillGaps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addSkillGap = async (req, res) => {
  try {
    const { traineeId, programId, category, skill, severity, notes } = req.body;

    if (!traineeId || !category || !skill) {
      return res.status(400).json({ success: false, message: 'Trainee, category, and skill name are required.' });
    }

    const newSkillGap = await SkillGap.create({
      traineeId,
      programId: programId || null,
      category,
      skill: skill.trim(),
      severity: severity || 'moderate',
      source: 'provider_review',
      reportedBy: req.user.name,
      notes: notes || '',
      recordedAt: new Date(),
    });

    await logAuditAction(req.user, 'ADD_SKILL_GAP', 'SkillGap', newSkillGap._id, { skill, category }, req);

    res.status(201).json({ success: true, message: 'Skill gap recorded.', data: newSkillGap });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
