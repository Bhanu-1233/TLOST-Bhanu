import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { Trainee } from '../models/Trainee.js';
import { EmploymentRecord } from '../models/EmploymentRecord.js';
import { logAuditAction } from '../middleware/auditMiddleware.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserRoleOrStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status, organization } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (role) user.role = role;
    if (status) user.status = status;
    if (organization !== undefined) user.organization = organization;

    await user.save();
    await logAuditAction(req.user, 'ADMIN_UPDATE_USER', 'User', user._id, { role, status, organization }, req);

    res.json({ success: true, message: 'User updated successfully.', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const { action, resourceType, limit = 50 } = req.query;
    const filter = {};

    if (action) filter.action = action;
    if (resourceType) filter.resourceType = resourceType;

    const logs = await AuditLog.find(filter).sort({ timestamp: -1 }).limit(Number(limit));
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportOutcomeData = async (req, res) => {
  try {
    const trainees = await Trainee.find().populate('programId', 'name code');
    const records = await EmploymentRecord.find().populate('traineeId', 'name email cohortName');

    const csvRows = [];
    csvRows.push([
      'Trainee Name',
      'Email',
      'Program',
      'Cohort',
      'Status',
      'Outcome Category',
      'Employer',
      'Role',
      'Wage Band',
      'Verification Status',
      'Last Reported Date',
    ].join(','));

    trainees.forEach(t => {
      const outcome = t.currentOutcome || {};
      const row = [
        `"${t.name || ''}"`,
        `"${t.email || ''}"`,
        `"${t.programName || ''}"`,
        `"${t.cohortName || ''}"`,
        `"${t.trainingStatus || ''}"`,
        `"${outcome.category || 'seeking_work'}"`,
        `"${outcome.employerName || ''}"`,
        `"${outcome.roleTitle || ''}"`,
        `"${outcome.wageBand || 'not_disclosed'}"`,
        `"${outcome.verificationStatus || 'not_verified'}"`,
        `"${outcome.lastReportedDate ? new Date(outcome.lastReportedDate).toISOString().split('T')[0] : ''}"`,
      ];
      csvRows.push(row.join(','));
    });

    const csvData = csvRows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="trainee_outcome_tracking_export.csv"');
    res.status(200).send(csvData);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
