import { AuditLog } from '../models/AuditLog.js';

export const logAuditAction = async (actor, action, resourceType, resourceId, details = {}, req = null) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1') : '127.0.0.1';
    
    await AuditLog.create({
      actorId: actor?._id ? actor._id.toString() : (actor?.id || 'system'),
      actorName: actor?.name || 'System Action',
      actorRole: actor?.role || 'system',
      action,
      resourceType,
      resourceId: resourceId ? resourceId.toString() : '',
      details,
      ipAddress,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Audit Logging Error (non-blocking):', error.message);
  }
};
