import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedDatabase } from './services/seedDataService.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import traineeRoutes from './routes/traineeRoutes.js';
import programRoutes from './routes/programRoutes.js';
import outcomeRoutes from './routes/outcomeRoutes.js';
import followUpRoutes from './routes/followUpRoutes.js';
import validationRoutes from './routes/validationRoutes.js';
import skillGapRoutes from './routes/skillGapRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/trainees', traineeRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/outcomes', outcomeRoutes);
app.use('/api/followups', followUpRoutes);
app.use('/api/validation', validationRoutes);
app.use('/api/skills', skillGapRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'Trainee Longitudinal Outcome Tracking API',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start Server and Connect Database
const startServer = async () => {
  try {
    await connectDB();
    
    // Auto seed database if empty
    await seedDatabase(false);

    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(` Trainee Outcome Tracking API running on port ${PORT}`);
      console.log(` Health Check: http://localhost:${PORT}/api/health`);
      console.log(`=================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();
