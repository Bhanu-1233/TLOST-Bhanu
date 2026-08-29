import { FollowUp } from '../models/FollowUp.js';
import { Trainee } from '../models/Trainee.js';
import { EmploymentRecord } from '../models/EmploymentRecord.js';
import { SkillGap } from '../models/SkillGap.js';
import { logAuditAction } from '../middleware/auditMiddleware.js';

export const getMyFollowUps = async (req, res) => {
  try {
    const trainee = await Trainee.findOne({ $or: [{ userId: req.user._id }, { email: req.user.email }] });
    if (!trainee) {
      return res.status(404).json({ success: false, message: 'No trainee record linked to this user.' });
    }

    const followUps = await FollowUp.find({ traineeId: trainee._id }).sort({ scheduledAt: 1 });
    res.json({ success: true, count: followUps.length, data: followUps, trainee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllFollowUps = async (req, res) => {
  try {
    const { status, checkpointType } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (checkpointType) filter.checkpointType = checkpointType;

    const followUps = await FollowUp.find(filter)
      .populate('traineeId', 'name email programName cohortName currentOutcome')
      .sort({ scheduledAt: 1 });

    res.json({ success: true, count: followUps.length, data: followUps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitFollowUpResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      working,
      outcomeCategory,
      employerName,
      roleTitle,
      wageBand,
      retentionStatus,
      supportNeeded,
      supportDetails,
      skillTrainingNeed,
      futurePlans,
    } = req.body;

    const followUp = await FollowUp.findById(id);
    if (!followUp) {
      return res.status(404).json({ success: false, message: 'Follow-up survey checkpoint not found.' });
    }

    const trainee = await Trainee.findById(followUp.traineeId);
    if (!trainee) {
      return res.status(404).json({ success: false, message: 'Associated trainee not found.' });
    }

    // Trainees can only submit their own follow-ups
    if (req.user.role === 'trainee') {
      const myTrainee = await Trainee.findOne({ $or: [{ userId: req.user._id }, { email: req.user.email }] });
      if (!myTrainee || myTrainee._id.toString() !== followUp.traineeId.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized survey submission.' });
      }
    }

    followUp.status = 'completed';
    followUp.completedAt = new Date();
    followUp.responses = {
      working: Boolean(working),
      outcomeCategory: outcomeCategory || (working ? 'employed' : 'seeking_work'),
      employerName: employerName || '',
      roleTitle: roleTitle || '',
      wageBand: wageBand || 'not_disclosed',
      retentionStatus: retentionStatus || (working ? 'still_employed' : 'not_working'),
      supportNeeded: Boolean(supportNeeded),
      supportDetails: supportDetails || '',
      skillTrainingNeed: skillTrainingNeed || '',
      futurePlans: futurePlans || '',
    };

    await followUp.save();

    // If working/employed details provided, record new historical outcome snapshot (Section 14)
    if (working && outcomeCategory) {
      const record = await EmploymentRecord.create({
        traineeId: trainee._id,
        category: outcomeCategory,
        employerName: employerName || '',
        roleTitle: roleTitle || '',
        wageBand: wageBand || 'not_disclosed',
        checkpoint: followUp.checkpointType,
        source: 'trainee_reported',
        verificationStatus: 'trainee_reported',
        recordedAt: new Date(),
        notes: `Recorded via ${followUp.checkpointType.replace('_', ' ')} follow-up survey`,
      });

      trainee.currentOutcome = {
        category: outcomeCategory,
        employerName: employerName || trainee.currentOutcome?.employerName || '',
        roleTitle: roleTitle || trainee.currentOutcome?.roleTitle || '',
        wageBand: wageBand || trainee.currentOutcome?.wageBand || 'not_disclosed',
        verificationStatus: 'trainee_reported',
        lastReportedDate: new Date(),
      };
      await trainee.save();
    }

    // If skill training need was noted, log as candidate skill gap
    if (skillTrainingNeed && skillTrainingNeed.trim()) {
      await SkillGap.create({
        traineeId: trainee._id,
        programId: trainee.programId || null,
        programName: trainee.programName || '',
        category: 'Technical Proficiency',
        skill: skillTrainingNeed.trim(),
        severity: 'minor',
        source: 'follow_up',
        reportedBy: `Trainee Follow-up (${followUp.checkpointType})`,
        notes: supportDetails || 'Self-reported during checkpoint survey',
      });
    }

    await logAuditAction(req.user, 'SUBMIT_FOLLOWUP', 'FollowUp', followUp._id, {
      checkpointType: followUp.checkpointType,
      working,
      wageBand,
    }, req);

    res.json({
      success: true,
      message: `${followUp.checkpointType.replace('_', ' ')} follow-up survey submitted successfully!`,
      data: followUp,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
