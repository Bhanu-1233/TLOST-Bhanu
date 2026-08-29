import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Trainee } from '../models/Trainee.js';
import { Consent } from '../models/Consent.js';
import { JWT_SECRET } from '../middleware/authMiddleware.js';
import { logAuditAction } from '../middleware/auditMiddleware.js';
import { seedDatabase } from '../services/seedDataService.js';

export const signup = async (req, res) => {
  try {
    const { name, email, password, role, organization, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const assignedRole = ['trainee', 'training_provider', 'employer', 'admin'].includes(role) ? role : 'trainee';
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: assignedRole,
      organization: organization || '',
      phone: phone || '',
      status: 'active',
    });

    // If signed up as a trainee, initialize default Trainee and Consent records
    if (assignedRole === 'trainee') {
      const traineeRecord = await Trainee.create({
        userId: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        cohortName: 'Self-Registered Cohort',
        trainingStatus: 'enrolled',
      });

      await Consent.create({
        traineeId: traineeRecord._id,
        userId: newUser._id,
        status: 'granted',
        version: '1.0',
        purpose: 'Consent for longitudinal outcome tracking, 30/90/180-day micro-surveys, and employer validation under privacy policies.',
        givenAt: new Date(),
        history: [{
          action: 'granted',
          version: '1.0',
          timestamp: new Date(),
          notes: 'Granted upon user signup registration',
        }],
      });
    }

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await logAuditAction(newUser, 'USER_SIGNUP', 'User', newUser._id, { role: assignedRole }, req);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        organization: newUser.organization,
      },
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ success: false, message: 'Server error during signup.', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await logAuditAction(user, 'USER_LOGIN', 'User', user._id, { role: user.role }, req);

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.', error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = req.user;
    let traineeProfile = null;
    if (user.role === 'trainee') {
      traineeProfile = await Trainee.findOne({ $or: [{ userId: user._id }, { email: user.email }] });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        phone: user.phone,
      },
      traineeProfile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const seedDatabaseEndpoint = async (req, res) => {
  try {
    const result = await seedDatabase(true);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Seed error: ' + error.message });
  }
};
