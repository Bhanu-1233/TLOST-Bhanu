import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Briefcase,
  ShieldCheck,
  User,
  Activity,
  CheckCircle2,
  TrendingUp,
  Clock,
  FileCheck,
  Lock,
  ArrowRight,
  Database,
  Layers,
} from 'lucide-react';

export const LandingPage = () => {
  const { demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleDemoAccess = async (role, path) => {
    const res = await demoLogin(role);
    if (res.success) {
      navigate(path);
    }
  };

  const roles = [
    {
      roleKey: 'trainee',
      title: 'Trainee Portal',
      description: 'Consent management, 30/90/180-day micro-surveys, outcome reporting, and wage progression tracking.',
      icon: GraduationCap,
      color: 'border-emerald-500/30 hover:border-emerald-500 bg-emerald-950/10 text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300',
      path: '/trainee',
      features: ['Privacy-first consent', '30/90/180-day follow-ups', 'Wage band progression', 'Historical timeline'],
    },
    {
      roleKey: 'training_provider',
      title: 'Training Provider Portal',
      description: 'Manage cohorts, mark course completions, dispatch follow-ups, and generate secure employer validation links.',
      icon: Briefcase,
      color: 'border-blue-500/30 hover:border-blue-500 bg-blue-950/10 text-blue-400',
      badge: 'bg-blue-500/20 text-blue-300',
      path: '/provider',
      features: ['Programs & Cohorts CRUD', 'Trainee timeline explorer', 'Validation link generator', 'Follow-up queue'],
    },
    {
      roleKey: 'employer',
      title: 'Employer Portal & Links',
      description: 'Frictionless token-based verification, wage confirmation, and structured skill-gap feedback.',
      icon: ShieldCheck,
      color: 'border-purple-500/30 hover:border-purple-500 bg-purple-950/10 text-purple-400',
      badge: 'bg-purple-500/20 text-purple-300',
      path: '/employer',
      features: ['Token-based verification', 'Minimal privacy data view', 'Structured skill gaps', 'Company directory'],
    },
    {
      roleKey: 'admin',
      title: 'System Admin Control',
      description: 'System-wide analytics, Section 22 rule recommendations, user RBAC administration, and audit trails.',
      icon: User,
      color: 'border-rose-500/30 hover:border-rose-500 bg-rose-950/10 text-rose-400',
      badge: 'bg-rose-500/20 text-rose-300',
      path: '/admin',
      features: ['Actionable rule engine', 'Retention & KPI analytics', 'RBAC & Audit logs', '1-Click data reseed'],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-12 pb-16 border-b border-slate-800/80">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Activity className="w-3.5 h-3.5" />
              Trainee Longitudinal Outcome Tracking System
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Privacy-Conscious, Low-Burden <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Trainee Outcome Verification System
              </span>
            </h1>
            <p className="mt-4 text-base text-slate-400 leading-relaxed">
              Connect training programs with real-world longitudinal outcomes over time: 30-, 90-, and 180-day
              follow-ups, wage band progression snapshots, employer validation tokens, and actionable curriculum
              recommendations.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/signup"
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition"
              >
                Sign Up with Role 
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition"
              >
                Role-Based Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Role-Based Portals Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">Dedicated Portals for Every Role</h2>
          <p className="text-sm text-slate-400 mt-1">
            Click any role below to instantly explore its dedicated dashboard with simulated seed data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.roleKey}
                className={`rounded-2xl border ${item.color} p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-xl`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${item.badge}`}>
                      {item.title.split(' ')[0]}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">{item.description}</p>

                  <ul className="space-y-1.5 mb-6 text-xs text-slate-300">
                    {item.features.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleDemoAccess(item.roleKey, item.path)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-2 transition"
                >
                  <span>Launch {item.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Core Architectural Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            MVP Specifications & Technical Compliance
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
            <div className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <Lock className="w-4 h-4" />
                Privacy-by-Design & Consent
              </div>
              <p className="text-slate-400 leading-relaxed">
                Explicit purpose-specific consent (v1.0), auditable withdrawal, minimal data collection, and wage bands
                without exact salary intrusion.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                <Database className="w-4 h-4" />
                Preserve Historical Snapshots
              </div>
              <p className="text-slate-400 leading-relaxed">
                Immutable snapshots record longitudinal transitions across 30, 90, and 180 days to compute 3-month and 6-month
                retention accurately.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
                <FileCheck className="w-4 h-4" />
                Secure Employer Validation
              </div>
              <p className="text-slate-400 leading-relaxed">
                Random time-limited tokens for direct employer review with structured skill-gap feedback (Section 20).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
