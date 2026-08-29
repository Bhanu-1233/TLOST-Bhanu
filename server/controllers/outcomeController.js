import { Trainee } from '../models/Trainee.js';
import { EmploymentRecord } from '../models/EmploymentRecord.js';
import { logAuditAction } from '../middleware/auditMiddleware.js';

export const recordOutcome = async (req, res) => {
  try {
    const {
      traineeId,
      category,
      employerName,
      employerEmail,
      roleTitle,
      joiningDate,
      employmentType,
      wageBand,
      checkpoint,
      notes,
    } = req.body;

    let targetTraineeId = traineeId;

    // If trainee role, ensure they are reporting their own outcome
    if (req.user.role === 'trainee') {
      const myTrainee = await Trainee.findOne({ $or: [{ userId: req.user._id }, { email: req.user.email }] });
      if (!myTrainee) {
        return res.status(404).json({ success: false, message: 'Trainee profile not found for this account.' });
      }
      targetTraineeId = myTrainee._id;
    }

    const trainee = await Trainee.findById(targetTraineeId);
    if (!trainee) {
      return res.status(404).json({ success: false, message: 'Trainee not found.' });
    }

    // 1. Create Immutable Historical Record Snapshot (Section 14)
    const newRecord = await EmploymentRecord.create({
      traineeId: trainee._id,
      category: category || 'seeking_work',
      employerName: employerName || '',
      employerEmail: employerEmail || '',
      roleTitle: roleTitle || '',
      joiningDate: joiningDate ? new Date(joiningDate) : null,
      employmentType: employmentType || 'full_time',
      wageBand: wageBand || 'not_disclosed',
      checkpoint: checkpoint || 'ad_hoc',
      source: req.user.role === 'trainee' ? 'trainee_reported' : 'provider_reported',
      verificationStatus: 'trainee_reported',
      notes: notes || '',
      recordedAt: new Date(),
    });

    // 2. Update currentOutcome on Trainee document for fast reference
    trainee.currentOutcome = {
      category: newRecord.category,
      employerName: newRecord.employerName,
      employerEmail: newRecord.employerEmail,
      roleTitle: newRecord.roleTitle,
      joiningDate: newRecord.joiningDate,
      employmentType: newRecord.employmentType,
      wageBand: newRecord.wageBand,
      verificationStatus: 'trainee_reported',
      lastReportedDate: new Date(),
    };

    await trainee.save();

    await logAuditAction(req.user, 'RECORD_OUTCOME_SNAPSHOT', 'EmploymentRecord', newRecord._id, {
      traineeId: trainee._id,
      category: newRecord.category,
      wageBand: newRecord.wageBand,
      checkpoint,
    }, req);

    res.status(201).json({
      success: true,
      message: 'Outcome snapshot recorded and longitudinal history updated.',
      data: newRecord,
      currentOutcome: trainee.currentOutcome,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOutcomeHistory = async (req, res) => {
  try {
    const { traineeId } = req.params;

    if (req.user.role === 'trainee') {
      const myTrainee = await Trainee.findOne({ $or: [{ userId: req.user._id }, { email: req.user.email }] });
      if (!myTrainee || myTrainee._id.toString() !== traineeId) {
        return res.status(403).json({ success: false, message: 'Unauthorized access to outcome history.' });
      }
    }

    const records = await EmploymentRecord.find({ traineeId }).sort({ recordedAt: -1 });
    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
