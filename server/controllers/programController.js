import { TrainingProgram } from '../models/TrainingProgram.js';
import { Trainee } from '../models/Trainee.js';
import { logAuditAction } from '../middleware/auditMiddleware.js';

export const getAllPrograms = async (req, res) => {
  try {
    const programs = await TrainingProgram.find().sort({ createdAt: -1 });
    
    // Attach trainee count stats to each program
    const programStats = await Promise.all(programs.map(async (p) => {
      const traineeCount = await Trainee.countDocuments({ programId: p._id });
      const completedCount = await Trainee.countDocuments({ programId: p._id, trainingStatus: 'completed' });
      return {
        ...p.toObject(),
        totalTrainees: traineeCount,
        completedTrainees: completedCount,
      };
    }));

    res.json({ success: true, data: programStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProgram = async (req, res) => {
  try {
    const { name, code, skillArea, durationWeeks, description, cohorts } = req.body;

    if (!name || !code || !skillArea) {
      return res.status(400).json({ success: false, message: 'Name, code, and skill area are required.' });
    }

    const existing = await TrainingProgram.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Program code already exists.' });
    }

    const newProgram = await TrainingProgram.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      providerId: req.user._id,
      providerName: req.user.organization || req.user.name,
      skillArea,
      durationWeeks: Number(durationWeeks) || 12,
      description: description || '',
      cohorts: cohorts && cohorts.length ? cohorts : [
        { name: 'Cohort 1', code: `${code.toUpperCase()}-C1`, startDate: new Date(), active: true }
      ],
    });

    await logAuditAction(req.user, 'CREATE_PROGRAM', 'TrainingProgram', newProgram._id, { code: newProgram.code }, req);

    res.status(201).json({ success: true, message: 'Program created successfully.', data: newProgram });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addCohort = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, startDate, completionDate } = req.body;

    const program = await TrainingProgram.findById(id);
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found.' });
    }

    program.cohorts.push({
      name: name || `Cohort ${program.cohorts.length + 1}`,
      code: code || `${program.code}-C${program.cohorts.length + 1}`,
      startDate: startDate ? new Date(startDate) : new Date(),
      completionDate: completionDate ? new Date(completionDate) : null,
      active: true,
    });

    await program.save();
    await logAuditAction(req.user, 'ADD_COHORT', 'TrainingProgram', program._id, { cohortName: name }, req);

    res.json({ success: true, message: 'Cohort added successfully.', data: program });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
