import { calculateSystemAnalytics } from '../services/analyticsEngine.js';

export const getOverviewAnalytics = async (req, res) => {
  try {
    const { programId } = req.query;
    const analytics = await calculateSystemAnalytics(programId || null);
    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
