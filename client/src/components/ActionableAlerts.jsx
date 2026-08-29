import React from 'react';
import { AlertTriangle, Info, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';

export const ActionableAlerts = ({ recommendations = [] }) => {
  if (!recommendations || recommendations.length === 0) return null;

  const iconMap = {
    critical: ShieldAlert,
    warning: AlertTriangle,
    info: Info,
    success: CheckCircle2,
  };

  const styleMap = {
    critical: {
      border: 'border-rose-500/40 bg-rose-950/20',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      iconColor: 'text-rose-400',
    },
    warning: {
      border: 'border-amber-500/40 bg-amber-950/20',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      iconColor: 'text-amber-400',
    },
    info: {
      border: 'border-blue-500/40 bg-blue-950/20',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      iconColor: 'text-blue-400',
    },
    success: {
      border: 'border-emerald-500/40 bg-emerald-950/20',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      iconColor: 'text-emerald-400',
    },
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Actionable Outcome Recommendations (Section 22 Rules)
        </h3>
        <span className="text-xs text-slate-400">Automated Rule-Based Guidance</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {recommendations.map((rec, idx) => {
          const style = styleMap[rec.type] || styleMap.info;
          const Icon = iconMap[rec.type] || Info;

          return (
            <div
              key={rec.id || idx}
              className={`p-4 rounded-xl border ${style.border} flex flex-col justify-between transition hover:scale-[1.01]`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${style.iconColor}`} />
                    <span className="font-semibold text-sm text-slate-200">{rec.metric}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${style.badge}`}>
                    {rec.priority} Priority
                  </span>
                </div>
                <div className="text-xs text-slate-400 mb-2">
                  Trigger: <span className="text-slate-300 font-mono">{rec.rule}</span> ({rec.value})
                </div>
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <strong className="text-emerald-400">Action: </strong> {rec.suggestedAction}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActionableAlerts;
