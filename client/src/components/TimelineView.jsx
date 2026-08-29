import React from 'react';
import {
  GraduationCap,
  Briefcase,
  CheckCircle,
  Clock,
  ShieldCheck,
  Award,
  AlertCircle,
  TrendingUp,
  FileText,
} from 'lucide-react';

export const TimelineView = ({ trainee, consent, employmentRecords = [], followUps = [], validationRequests = [], skillGaps = [] }) => {
  // Build a unified chronological timeline
  const events = [];

  // 1. Enrollment
  if (trainee?.enrollmentDate) {
    events.push({
      date: new Date(trainee.enrollmentDate),
      title: 'Enrolled in Program',
      subtitle: `${trainee.programName || 'Training Program'} (${trainee.cohortName || 'Cohort'})`,
      type: 'enrollment',
      icon: GraduationCap,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    });
  }

  // 2. Consent
  if (consent) {
    events.push({
      date: new Date(consent.givenAt || trainee.createdAt),
      title: `Consent Granted (v${consent.version || '1.0'})`,
      subtitle: consent.status === 'granted' ? 'Active longitudinal tracking consent' : 'Consent Withdrawn',
      type: 'consent',
      icon: ShieldCheck,
      color: consent.status === 'granted' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    });
  }

  // 3. Completion
  if (trainee?.completionDate || trainee?.trainingStatus === 'completed') {
    events.push({
      date: new Date(trainee.completionDate || trainee.updatedAt),
      title: 'Training Completed Successfully',
      subtitle: `Graduated from ${trainee.programName || 'Course'}`,
      type: 'completion',
      icon: Award,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    });
  }

  // 4. Employment records (History snapshots)
  employmentRecords.forEach((rec) => {
    events.push({
      date: new Date(rec.recordedAt || rec.createdAt),
      title: `Outcome Snapshot: ${rec.category.replace('_', ' ').toUpperCase()}`,
      subtitle: `${rec.roleTitle || 'Role'} at ${rec.employerName || 'Organization'} | Wage Band: ${rec.wageBand || 'N/A'}`,
      details: {
        type: rec.employmentType,
        status: rec.verificationStatus,
        notes: rec.notes,
        verifiedBy: rec.verifiedBy,
      },
      type: 'employment',
      icon: Briefcase,
      color: rec.verificationStatus === 'employer_verified'
        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
        : 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    });
  });

  // 5. Follow-ups
  followUps.forEach((fu) => {
    events.push({
      date: new Date(fu.completedAt || fu.scheduledAt),
      title: `${fu.checkpointType.replace('_', ' ')} Micro-Survey Checkpoint`,
      subtitle: `Status: ${fu.status.toUpperCase()}${fu.completedAt ? ` (Completed: ${new Date(fu.completedAt).toLocaleDateString()})` : ''}`,
      details: fu.responses,
      type: 'followup',
      icon: Clock,
      color: fu.status === 'completed'
        ? 'text-teal-400 bg-teal-500/10 border-teal-500/30'
        : 'text-slate-400 bg-slate-800 border-slate-700',
    });
  });

  // 6. Validations
  validationRequests.forEach((vr) => {
    if (vr.status === 'completed') {
      events.push({
        date: new Date(vr.completedAt || vr.updatedAt),
        title: 'Employer Validation Completed',
        subtitle: `Confirmed by ${vr.employerName || 'Employer'} (${vr.employerEmail})`,
        details: vr.feedback,
        type: 'validation',
        icon: CheckCircle,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      });
    }
  });

  // Sort chronologically ascending
  events.sort((a, b) => a.date - b.date);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Longitudinal Trainee Journey & History Timeline
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Preserved historical outcome snapshots and follow-up progression over time.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">
          {events.length} Milestones
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {events.map((ev, index) => {
          const Icon = ev.icon || Clock;
          return (
            <div key={index} className="relative group">
              {/* Timeline marker icon */}
              <div
                className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center border ${ev.color} shadow-sm group-hover:scale-110 transition`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>

              {/* Event Content */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 hover:border-slate-700 transition">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-200">{ev.title}</span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {ev.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{ev.subtitle}</p>

                {/* Extra Snapshot Details if available */}
                {ev.details && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/60 text-xs text-slate-300 space-y-1">
                    {ev.details.status && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">Verification:</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold ${
                          ev.details.status === 'employer_verified' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {ev.details.status.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                    {ev.details.wageBand && ev.details.wageBand !== 'not_disclosed' && (
                      <div><span className="text-slate-500">Wage Band:</span> <strong className="text-emerald-400">{ev.details.wageBand}</strong></div>
                    )}
                    {ev.details.comments && (
                      <p className="italic text-slate-400 bg-slate-900 p-1.5 rounded text-[11px]">
                        "{ev.details.comments}"
                      </p>
                    )}
                    {ev.details.skillTrainingNeed && (
                      <div><span className="text-slate-500">Skill Need:</span> {ev.details.skillTrainingNeed}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineView;
