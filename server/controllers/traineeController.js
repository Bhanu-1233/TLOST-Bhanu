import { Trainee } from '../models/Trainee.js';
import { TrainingProgram } from '../models/TrainingProgram.js';
import { Consent } from '../models/Consent.js';
import { EmploymentRecord } from '../models/EmploymentRecord.js';
import { FollowUp } from '../models/FollowUp.js';
import { ValidationRequest } from '../models/ValidationRequest.js';
import { SkillGap } from '../models/SkillGap.js';
import { logAuditAction } from '../middleware/auditMiddleware.js';

export const getAllTrainees = async (req, res) => {
  try {
    const { search, programId, cohortName, status, outcome } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'currentOutcome.employerName': { $regex: search, $options: 'i' } },
        { 'currentOutcome.roleTitle': { $regex: search, $options: 'i' } },
      ];
    }

    if (programId) filter.programId = programId;
    if (cohortName) filter.cohortName = cohortName;
    if (status) filter.trainingStatus = status;
    if (outcome) filter['currentOutcome.category'] = outcome;

    const trainees = await Trainee.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: trainees.length, data: trainees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTraineeById = async (req, res) => {
  try {
    const { id } = req.params;

    // RBAC: Trainees can only view their own profile unless admin/provider
    if (req.user.role === 'trainee') {
      const myProfile = await Trainee.findOne({ $or: [{ userId: req.user._id }, { email: req.user.email }] });
      if (!myProfile || myProfile._id.toString() !== id) {
        return res.status(403).json({ success: false, message: 'You are only authorized to view your own trainee profile.' });
      }
    }

    const trainee = await Trainee.findById(id);
    if (!trainee) {
      return res.status(404).json({ success: false, message: 'Trainee record not found.' });
    }

    // Fetch complete longitudinal timeline items
    const [consent, employmentRecords, followUps, validationRequests, skillGaps] = await Promise.all([
      Consent.findOne({ traineeId: trainee._id }),
      EmploymentRecord.find({ traineeId: trainee._id }).sort({ recordedAt: -1 }),
      FollowUp.find({ traineeId: trainee._id }).sort({ scheduledAt: 1 }),
      ValidationRequest.find({ traineeId: trainee._id }).sort({ createdAt: -1 }),
      SkillGap.find({ traineeId: trainee._id }).sort({ recordedAt: -1 }),
    ]);

    res.json({
      success: true,
      data: {
        trainee,
        consent,
        employmentRecords,
        followUps,
        validationRequests,
        skillGaps,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTrainee = async (req, res) => {
  try {
    const { name, email, phone, programId, cohortName, enrollmentDate } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    let programName = '';
    if (programId) {
      const prog = await TrainingProgram.findById(programId);
      if (prog) programName = prog.name;
    }

    const trainee = await Trainee.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || '',
      programId: programId || null,
      programName,
      cohortName: cohortName || 'General Cohort',
      enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : new Date(),
      trainingStatus: 'enrolled',
    });

    // Create default consent entry
    const consent = await Consent.create({
      traineeId: trainee._id,
      status: 'granted',
      version: '1.0',
      purpose: 'Consent for longitudinal outcome tracking, 30/90/180-day follow-ups, and employer validation under privacy policies.',
      givenAt: new Date(),
      history: [{
        action: 'granted',
        version: '1.0',
        timestamp: new Date(),
        notes: 'Created during provider trainee onboarding',
      }],
    });

    await logAuditAction(req.user, 'CREATE_TRAINEE', 'Trainee', trainee._id, { name: trainee.name, programName }, req);

    res.status(201).json({ success: true, message: 'Trainee created successfully.', data: trainee, consent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTrainee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, cohortName, programId } = req.body;

    const trainee = await Trainee.findById(id);
    if (!trainee) {
      return res.status(404).json({ success: false, message: 'Trainee not found.' });
    }

    // Trainees can update contact info; Providers/Admins can update program & cohort
    if (name) trainee.name = name;
    if (email) trainee.email = email.toLowerCase().trim();
    if (phone !== undefined) trainee.phone = phone;

    if (['admin', 'training_provider'].includes(req.user.role)) {
      if (cohortName) trainee.cohortName = cohortName;
      if (programId) {
        trainee.programId = programId;
        const prog = await TrainingProgram.findById(programId);
        if (prog) trainee.programName = prog.name;
      }
    }

    await trainee.save();
    await logAuditAction(req.user, 'UPDATE_TRAINEE', 'Trainee', trainee._id, { updatedFields: req.body }, req);

    res.json({ success: true, message: 'Trainee updated successfully.', data: trainee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const recordTrainingCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const { completionDate } = req.body;

    const trainee = await Trainee.findById(id);
    if (!trainee) {
      return res.status(404).json({ success: false, message: 'Trainee not found.' });
    }

    const cDate = completionDate ? new Date(completionDate) : new Date();
    trainee.trainingStatus = 'completed';
    trainee.completionDate = cDate;
    await trainee.save();

    // Section 6 & 7.5: System automatically schedules 30-, 90-, and 180-day follow-ups from completion date
    const day30 = new Date(cDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const day90 = new Date(cDate.getTime() + 90 * 24 * 60 * 60 * 1000);
    const day180 = new Date(cDate.getTime() + 180 * 24 * 60 * 60 * 1000);

    // Remove any previously scheduled future follow-ups for clean state
    await FollowUp.deleteMany({ traineeId: trainee._id, status: 'scheduled' });

    await FollowUp.insertMany([
      { traineeId: trainee._id, userId: trainee.userId || null, checkpointType: '30_day', scheduledAt: day30, status: 'scheduled' },
      { traineeId: trainee._id, userId: trainee.userId || null, checkpointType: '90_day', scheduledAt: day90, status: 'scheduled' },
      { traineeId: trainee._id, userId: trainee.userId || null, checkpointType: '180_day', scheduledAt: day180, status: 'scheduled' },
    ]);

    await logAuditAction(req.user, 'RECORD_COMPLETION', 'Trainee', trainee._id, { completionDate: cDate }, req);

    res.json({
      success: true,
      message: 'Training completion recorded and 30/90/180-day follow-ups scheduled.',
      data: trainee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateConsent = async (req, res) => {
  try {
    const { id } = req.params; // traineeId
    const { action, notes } = req.body; // action: 'granted' or 'withdrawn'

    if (!['granted', 'withdrawn'].includes(action)) {
      return res.status(400).json({ success: false, message: "Action must be 'granted' or 'withdrawn'." });
    }

    let consent = await Consent.findOne({ traineeId: id });
    if (!consent) {
      consent = new Consent({ traineeId: id, status: action, version: '1.0' });
    }

    consent.status = action;
    if (action === 'granted') {
      consent.givenAt = new Date();
      consent.withdrawnAt = null;
    } else {
      consent.withdrawnAt = new Date();
    }

    consent.history.push({
      action,
      version: consent.version || '1.0',
      timestamp: new Date(),
      ipAddress: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1',
      notes: notes || `Consent ${action} by user`,
    });

    await consent.save();
    await logAuditAction(req.user, `CONSENT_${action.toUpperCase()}`, 'Consent', consent._id, { traineeId: id, notes }, req);

    res.json({ success: true, message: `Consent successfully ${action}.`, data: consent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
