import crypto from 'crypto';
import { ValidationRequest } from '../models/ValidationRequest.js';
import { Trainee } from '../models/Trainee.js';
import { EmploymentRecord } from '../models/EmploymentRecord.js';
import { SkillGap } from '../models/SkillGap.js';
import { logAuditAction } from '../middleware/auditMiddleware.js';

// 1. Provider creates a new time-limited validation request
export const createValidationRequest = async (req, res) => {
  try {
    const { traineeId, employmentRecordId, employerEmail, employerName, expiresInDays = 14 } = req.body;

    if (!traineeId || !employerEmail) {
      return res.status(400).json({ success: false, message: 'Trainee ID and employer email are required.' });
    }

    const trainee = await Trainee.findById(traineeId);
    if (!trainee) {
      return res.status(404).json({ success: false, message: 'Trainee not found.' });
    }

    // Find the latest employment record if not specified
    let targetRecordId = employmentRecordId;
    if (!targetRecordId) {
      const latestRecord = await EmploymentRecord.findOne({ traineeId: trainee._id }).sort({ recordedAt: -1 });
      if (latestRecord) {
        targetRecordId = latestRecord._id;
      } else {
        // Create an initial record from trainee currentOutcome
        const newRec = await EmploymentRecord.create({
          traineeId: trainee._id,
          category: trainee.currentOutcome?.category || 'employed',
          employerName: employerName || trainee.currentOutcome?.employerName || 'Employer',
          employerEmail: employerEmail,
          roleTitle: trainee.currentOutcome?.roleTitle || 'Employee',
          wageBand: trainee.currentOutcome?.wageBand || 'not_disclosed',
          source: 'provider_reported',
          verificationStatus: 'trainee_reported',
        });
        targetRecordId = newRec._id;
      }
    }

    // Generate random secure token & its SHA256 hash
    const rawToken = 'val_' + crypto.randomBytes(24).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    const validationReq = await ValidationRequest.create({
      traineeId: trainee._id,
      employmentRecordId: targetRecordId,
      requestedByProviderId: req.user._id,
      employerEmail: employerEmail.toLowerCase().trim(),
      employerName: employerName || trainee.currentOutcome?.employerName || 'Employer Organization',
      token: rawToken,
      tokenHash,
      expiresAt,
      status: 'pending',
    });

    await logAuditAction(req.user, 'CREATE_VALIDATION_REQUEST', 'ValidationRequest', validationReq._id, {
      traineeId: trainee._id,
      employerEmail,
    }, req);

    res.status(201).json({
      success: true,
      message: 'Secure employer validation link generated successfully.',
      data: validationReq,
      validationLink: `/validation/${rawToken}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Public / Token-based route to inspect validation request (Privacy-Preserving Minimal Data)
export const getValidationByToken = async (req, res) => {
  try {
    const { token } = req.params;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const request = await ValidationRequest.findOne({
      $or: [{ token }, { tokenHash }],
    }).populate('traineeId', 'name email programName cohortName currentOutcome');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Invalid or expired validation link.' });
    }

    if (new Date() > new Date(request.expiresAt)) {
      request.status = 'expired';
      await request.save();
      return res.status(410).json({ success: false, message: 'This validation link has expired.' });
    }

    const employmentRecord = await EmploymentRecord.findById(request.employmentRecordId);

    // Return only necessary, privacy-conscious data (Section 18 & Section 20)
    res.json({
      success: true,
      data: {
        requestId: request._id,
        status: request.status,
        expiresAt: request.expiresAt,
        employerName: request.employerName,
        employerEmail: request.employerEmail,
        trainee: {
          name: request.traineeId?.name,
          programName: request.traineeId?.programName,
          cohortName: request.traineeId?.cohortName,
        },
        employmentDetails: {
          roleTitle: employmentRecord?.roleTitle || request.traineeId?.currentOutcome?.roleTitle,
          joiningDate: employmentRecord?.joiningDate || request.traineeId?.currentOutcome?.joiningDate,
          employmentType: employmentRecord?.employmentType || request.traineeId?.currentOutcome?.employmentType,
          wageBand: employmentRecord?.wageBand || request.traineeId?.currentOutcome?.wageBand,
        },
        completedFeedback: request.feedback,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Employer submits confirmation/rejection and structured skill gaps
export const submitValidation = async (req, res) => {
  try {
    const { token } = req.params;
    const {
      confirmed,
      roleConfirmed,
      startDateConfirmed,
      wageBandConfirmed,
      performanceRating,
      comments,
      skillGaps, // Array of { category, skill, severity, notes }
      correctedRole,
      correctedWageBand,
    } = req.body;

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const request = await ValidationRequest.findOne({
      $or: [{ token }, { tokenHash }],
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Validation request not found or invalid token.' });
    }

    if (request.status === 'completed') {
      return res.status(400).json({ success: false, message: 'This validation request has already been completed.' });
    }

    if (new Date() > new Date(request.expiresAt)) {
      request.status = 'expired';
      await request.save();
      return res.status(410).json({ success: false, message: 'Validation link has expired.' });
    }

    const trainee = await Trainee.findById(request.traineeId);
    const record = await EmploymentRecord.findById(request.employmentRecordId);

    const isConfirmed = confirmed !== false;

    // Update validation request
    request.status = isConfirmed ? 'completed' : 'rejected';
    request.completedAt = new Date();
    request.feedback = {
      confirmed: isConfirmed,
      roleConfirmed: roleConfirmed !== false,
      startDateConfirmed: startDateConfirmed !== false,
      wageBandConfirmed: wageBandConfirmed !== false,
      performanceRating: performanceRating || 'satisfactory',
      comments: comments || '',
      skillGapsIdentified: skillGaps ? skillGaps.map(s => s.skill || s) : [],
    };
    await request.save();

    // Update Employment Record verification status
    if (record) {
      record.verificationStatus = isConfirmed ? 'employer_verified' : 'rejected';
      record.verifiedAt = new Date();
      record.verifiedBy = request.employerName || 'Employer Direct Link';
      if (correctedRole) record.roleTitle = correctedRole;
      if (correctedWageBand) record.wageBand = correctedWageBand;
      if (!isConfirmed) record.rejectionReason = comments || 'Rejected by employer';
      await record.save();
    }

    // Update Trainee current outcome verification status
    if (trainee && trainee.currentOutcome) {
      trainee.currentOutcome.verificationStatus = isConfirmed ? 'employer_verified' : 'rejected';
      if (correctedRole) trainee.currentOutcome.roleTitle = correctedRole;
      if (correctedWageBand) trainee.currentOutcome.wageBand = correctedWageBand;
      await trainee.save();
    }

    // Save structured skill gap items
    if (skillGaps && Array.isArray(skillGaps) && skillGaps.length > 0) {
      const skillDocs = skillGaps.map(sg => ({
        traineeId: trainee?._id || request.traineeId,
        programId: trainee?.programId || null,
        programName: trainee?.programName || '',
        category: sg.category || 'Technical Proficiency',
        skill: sg.skill || String(sg),
        severity: sg.severity || 'moderate',
        source: 'employer_validation',
        reportedBy: request.employerName || 'Employer Validation',
        notes: sg.notes || comments || '',
        recordedAt: new Date(),
      }));

      await SkillGap.insertMany(skillDocs);
    }

    await logAuditAction(
      { name: request.employerName || 'Employer', role: 'employer', id: request.employerEmail },
      isConfirmed ? 'EMPLOYER_VERIFY_SUCCESS' : 'EMPLOYER_VERIFY_REJECTED',
      'ValidationRequest',
      request._id,
      { isConfirmed, comments },
      req
    );

    res.json({
      success: true,
      message: isConfirmed
        ? 'Employment details verified and skill feedback saved successfully!'
        : 'Feedback recorded and status updated.',
      data: request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Employer / Provider Dashboard list of validation requests
export const getValidationRequests = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'employer') {
      filter.$or = [
        { employerEmail: req.user.email },
        { employerName: { $regex: req.user.organization || req.user.name, $options: 'i' } },
      ];
    }

    const requests = await ValidationRequest.find(filter)
      .populate('traineeId', 'name email programName cohortName currentOutcome')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
