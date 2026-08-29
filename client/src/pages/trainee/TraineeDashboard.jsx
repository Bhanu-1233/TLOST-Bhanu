import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { traineeAPI, outcomeAPI, followUpAPI } from '../../services/api';
import { TimelineView } from '../../components/TimelineView';
import { Modal } from '../../components/Modal';
import { RoleBadge } from '../../components/RoleBadge';
import {
  GraduationCap,
  ShieldCheck,
  Clock,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  PlusCircle,
  Phone,
  Mail,
  Building,
  DollarSign,
  FileText,
  ShieldAlert,
  Send,
} from 'lucide-react';

export const TraineeDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [traineeData, setTraineeData] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Modals
  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const [outcomeModalOpen, setOutcomeModalOpen] = useState(false);
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  const [activeFollowUp, setActiveFollowUp] = useState(null);

  // Outcome Form State
  const [outcomeForm, setOutcomeForm] = useState({
    category: 'employed',
    employerName: '',
    employerEmail: '',
    roleTitle: '',
    joiningDate: '',
    employmentType: 'full_time',
    wageBand: '$60k-$80k',
    checkpoint: 'ad_hoc',
    notes: '',
  });

  // Follow-up Micro-Survey Form State (Conditional Questions)
  const [surveyForm, setSurveyForm] = useState({
    working: true,
    outcomeCategory: 'employed',
    employerName: '',
    roleTitle: '',
    wageBand: '$60k-$80k',
    retentionStatus: 'still_employed',
    supportNeeded: false,
    supportDetails: '',
    skillTrainingNeed: '',
    futurePlans: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Find trainee profile
      const traineesRes = await traineeAPI.getAll({ search: user.email });
      if (traineesRes.data.data && traineesRes.data.data.length > 0) {
        const tId = traineesRes.data.data[0]._id;
        const detailsRes = await traineeAPI.getById(tId);
        if (detailsRes.data.success) {
          setTraineeData(detailsRes.data.data);
        }
      }

      // Fetch follow-ups
      const fuRes = await followUpAPI.getMy();
      if (fuRes.data.success) {
        setFollowUps(fuRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching trainee dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleConsentToggle = async (action) => {
    try {
      if (!traineeData?.trainee?._id) return;
      const res = await traineeAPI.updateConsent(traineeData.trainee._id, {
        action,
        notes: `User explicitly chose to ${action} tracking consent`,
      });
      if (res.data.success) {
        setStatusMsg({ type: 'success', text: `Consent successfully ${action}!` });
        setConsentModalOpen(false);
        fetchData();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Error updating consent.' });
    }
  };

  const handleOutcomeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await outcomeAPI.record({
        traineeId: traineeData?.trainee?._id,
        ...outcomeForm,
      });
      if (res.data.success) {
        setStatusMsg({ type: 'success', text: 'New outcome snapshot and wage progression saved successfully!' });
        setOutcomeModalOpen(false);
        fetchData();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to record outcome.' });
    }
  };

  const handleOpenSurvey = (fu) => {
    setActiveFollowUp(fu);
    setSurveyForm({
      working: traineeData?.trainee?.currentOutcome?.category === 'employed',
      outcomeCategory: traineeData?.trainee?.currentOutcome?.category || 'employed',
      employerName: traineeData?.trainee?.currentOutcome?.employerName || '',
      roleTitle: traineeData?.trainee?.currentOutcome?.roleTitle || '',
      wageBand: traineeData?.trainee?.currentOutcome?.wageBand || '$60k-$80k',
      retentionStatus: 'still_employed',
      supportNeeded: false,
      supportDetails: '',
      skillTrainingNeed: '',
      futurePlans: '',
    });
    setSurveyModalOpen(true);
  };

  const handleSurveySubmit = async (e) => {
    e.preventDefault();
    if (!activeFollowUp) return;
    try {
      const res = await followUpAPI.submit(activeFollowUp._id, surveyForm);
      if (res.data.success) {
        setStatusMsg({ type: 'success', text: 'Follow-up survey response submitted successfully!' });
        setSurveyModalOpen(false);
        fetchData();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to submit survey.' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
          Loading Trainee Portal...
        </div>
      </div>
    );
  }

  const trainee = traineeData?.trainee;
  const consent = traineeData?.consent;
  const currentOutcome = trainee?.currentOutcome || {};

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Status Alerts */}
        {statusMsg.text && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
              statusMsg.type === 'success'
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{statusMsg.text}</span>
            </div>
            <button onClick={() => setStatusMsg({ type: '', text: '' })} className="hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <h1 className="text-2xl font-bold text-white tracking-tight">{trainee?.name || user.name}</h1>
                <RoleBadge role="trainee" size="lg" />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  {trainee?.programName || 'Training Program'}
                </span>
                <span>•</span>
                <span>Cohort: {trainee?.cohortName || 'Active Cohort'}</span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {trainee?.email || user.email}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setOutcomeModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition"
              >
                <PlusCircle className="w-4 h-4" />
                Report Outcome / Wage
              </button>

              <button
                onClick={() => setConsentModalOpen(true)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                  consent?.status === 'granted'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Consent: {consent?.status === 'granted' ? 'Active (v1.0)' : 'Withdrawn'}
              </button>
            </div>
          </div>
        </div>

        {/* Current Outcome Summary & Verification Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Status Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Current Employment Status</span>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xl font-bold text-white capitalize">
                {currentOutcome.category ? currentOutcome.category.replace('_', ' ') : 'Seeking Work'}
              </span>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                  currentOutcome.verificationStatus === 'employer_verified'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                {currentOutcome.verificationStatus ? currentOutcome.verificationStatus.replace('_', ' ') : 'Self Reported'}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {currentOutcome.roleTitle ? `${currentOutcome.roleTitle} at ${currentOutcome.employerName}` : 'No active employer reported'}
            </p>
          </div>

          {/* Wage Band Progression Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Wage Band Level</span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-xl font-bold text-emerald-400 font-mono">
                {currentOutcome.wageBand || 'Not Disclosed'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">(Privacy Band)</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Standardized bracket preserving confidentiality without requiring exact salary.
            </p>
          </div>

          {/* Privacy Consent Snapshot */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Privacy & Consent</span>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xl font-bold text-white">
                {consent?.status === 'granted' ? 'Protected & Active' : 'Consent Revoked'}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Under GDPR/Privacy-by-Design rules, you can grant or withdraw tracking consent at any time.
            </p>
          </div>
        </div>

        {/* Follow-up Micro-Surveys Queue (30, 90, 180-day Checkpoints) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                Longitudinal Follow-Up Micro-Surveys (30, 90, 180-Day)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Short 2-minute checkpoints designed to measure wage progression, retention, and support needs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['30_day', '90_day', '180_day'].map((type) => {
              const fu = followUps.find((f) => f.checkpointType === type);
              const isCompleted = fu?.status === 'completed';
              const title = type === '30_day' ? '30-Day Checkpoint' : type === '90_day' ? '90-Day Checkpoint' : '180-Day Checkpoint';

              return (
                <div
                  key={type}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    isCompleted
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-white">{title}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {isCompleted ? 'Completed' : 'Pending Response'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mb-3">
                      {type === '30_day' && 'Employment status, role & early onboarding support.'}
                      {type === '90_day' && '3-Month retention, wage band changes & skill requirements.'}
                      {type === '180_day' && '6-Month longitudinal retention & career advancement.'}
                    </p>

                    {isCompleted && fu.responses && (
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1 mb-3">
                        <div>Status: <strong>{fu.responses.outcomeCategory || 'Employed'}</strong></div>
                        {fu.responses.wageBand && <div>Wage Band: <span className="text-emerald-400">{fu.responses.wageBand}</span></div>}
                      </div>
                    )}
                  </div>

                  {!isCompleted && fu ? (
                    <button
                      onClick={() => handleOpenSurvey(fu)}
                      className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Complete Short Survey
                    </button>
                  ) : isCompleted ? (
                    <div className="text-[11px] text-emerald-400 text-center font-medium">✓ Response Recorded</div>
                  ) : (
                    <div className="text-[11px] text-slate-500 text-center">Scheduled upon completion</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Longitudinal History Timeline Component */}
        <TimelineView
          trainee={trainee}
          consent={consent}
          employmentRecords={traineeData?.employmentRecords || []}
          followUps={followUps}
          validationRequests={traineeData?.validationRequests || []}
          skillGaps={traineeData?.skillGaps || []}
        />
      </div>

      {/* MODAL 1: Consent Management */}
      <Modal isOpen={consentModalOpen} onClose={() => setConsentModalOpen(false)} title="Manage Longitudinal Tracking Consent">
        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-semibold text-white text-sm">Trainee Privacy Notice (Version 1.0)</h4>
            <p className="leading-relaxed text-slate-400">
              The Trainee Longitudinal Outcome Tracking System collects employment status, wage bands, and employer validation
              to measure long-term training efficacy and improve future curricula. We prioritize minimum data collection, never
              request unnecessary exact financial details, and use strict role-based access.
            </p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <div className="font-semibold text-white">Current Consent State</div>
              <div className="text-[11px] text-slate-400">
                {consent?.status === 'granted'
                  ? `Granted on ${new Date(consent.givenAt).toLocaleDateString()}`
                  : 'Consent is currently withdrawn'}
              </div>
            </div>
            <RoleBadge role="trainee" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            {consent?.status === 'granted' ? (
              <button
                onClick={() => handleConsentToggle('withdrawn')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition"
              >
                Withdraw Consent
              </button>
            ) : (
              <button
                onClick={() => handleConsentToggle('granted')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition"
              >
                Grant & Activate Consent
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* MODAL 2: Report Outcome / Wage Band Progression (Section 14 History Snapshot) */}
      <Modal isOpen={outcomeModalOpen} onClose={() => setOutcomeModalOpen(false)} title="Report Outcome & Wage Progression">
        <form onSubmit={handleOutcomeSubmit} className="space-y-4">
          <p className="text-xs text-slate-400">
            This creates an immutable historical milestone snapshot to track your wage progression over time.
          </p>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Outcome Category</label>
            <select
              value={outcomeForm.category}
              onChange={(e) => setOutcomeForm({ ...outcomeForm, category: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="employed">Employed (Full-Time / Part-Time / Contract)</option>
              <option value="self_employed">Self-Employed / Freelancer</option>
              <option value="apprentice">Apprenticeship / Internship</option>
              <option value="seeking_work">Actively Seeking Work</option>
              <option value="further_education">Further Higher Education</option>
              <option value="unavailable">Temporarily Unavailable / Other</option>
            </select>
          </div>

          {['employed', 'apprentice', 'self_employed'].includes(outcomeForm.category) && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Employer / Client Name</label>
                  <input
                    type="text"
                    value={outcomeForm.employerName}
                    onChange={(e) => setOutcomeForm({ ...outcomeForm, employerName: e.target.value })}
                    placeholder="e.g. CloudScale Dynamics"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Employer Contact Email</label>
                  <input
                    type="email"
                    value={outcomeForm.employerEmail}
                    onChange={(e) => setOutcomeForm({ ...outcomeForm, employerEmail: e.target.value })}
                    placeholder="hr@cloudscale.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Job Role Title</label>
                  <input
                    type="text"
                    value={outcomeForm.roleTitle}
                    onChange={(e) => setOutcomeForm({ ...outcomeForm, roleTitle: e.target.value })}
                    placeholder="e.g. Junior Full Stack Engineer"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Wage Band Bracket</label>
                  <select
                    value={outcomeForm.wageBand}
                    onChange={(e) => setOutcomeForm({ ...outcomeForm, wageBand: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="< $25k">&lt; $25,000 / year</option>
                    <option value="$25k-$40k">$25,000 - $40,000 / year</option>
                    <option value="$40k-$60k">$40,000 - $60,000 / year</option>
                    <option value="$60k-$80k">$60,000 - $80,000 / year</option>
                    <option value="$80k-$100k">$80,000 - $100,000 / year</option>
                    <option value="$100k+">$100,000+ / year</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Milestone Notes</label>
            <textarea
              rows={2}
              value={outcomeForm.notes}
              onChange={(e) => setOutcomeForm({ ...outcomeForm, notes: e.target.value })}
              placeholder="e.g. Promoted to full-time engineer after completing probation period."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOutcomeModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
            >
              Save Milestone Snapshot
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Micro-Survey Checkpoint Form (Section 19 Conditional Logic) */}
      <Modal
        isOpen={surveyModalOpen}
        onClose={() => setSurveyModalOpen(false)}
        title={`Micro-Survey: ${activeFollowUp?.checkpointType?.replace('_', ' ').toUpperCase()}`}
      >
        <form onSubmit={handleSurveySubmit} className="space-y-4">
          <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
            Section 19 Follow-up: Low-burden questionnaire tailored to your employment status.
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Are you currently employed or working?</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSurveyForm({ ...surveyForm, working: true, outcomeCategory: 'employed' })}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                  surveyForm.working
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-slate-950 border-slate-700 text-slate-300'
                }`}
              >
                Yes, I am working
              </button>
              <button
                type="button"
                onClick={() => setSurveyForm({ ...surveyForm, working: false, outcomeCategory: 'seeking_work' })}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                  !surveyForm.working
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-slate-950 border-slate-700 text-slate-300'
                }`}
              >
                No, seeking work / other
              </button>
            </div>
          </div>

          {/* Conditional Questions: Only shown if working === true */}
          {surveyForm.working ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Current Employer / Business</label>
                  <input
                    type="text"
                    value={surveyForm.employerName}
                    onChange={(e) => setSurveyForm({ ...surveyForm, employerName: e.target.value })}
                    placeholder="e.g. CloudScale Dynamics Inc."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Current Job Title</label>
                  <input
                    type="text"
                    value={surveyForm.roleTitle}
                    onChange={(e) => setSurveyForm({ ...surveyForm, roleTitle: e.target.value })}
                    placeholder="e.g. React Developer"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Current Wage Band</label>
                <select
                  value={surveyForm.wageBand}
                  onChange={(e) => setSurveyForm({ ...surveyForm, wageBand: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="< $25k">&lt; $25,000 / year</option>
                  <option value="$25k-$40k">$25,000 - $40,000 / year</option>
                  <option value="$40k-$60k">$40,000 - $60,000 / year</option>
                  <option value="$60k-$80k">$60,000 - $80,000 / year</option>
                  <option value="$80k-$100k">$80,000 - $100,000 / year</option>
                  <option value="$100k+">$100,000+ / year</option>
                </select>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Current Focus Area</label>
              <select
                value={surveyForm.outcomeCategory}
                onChange={(e) => setSurveyForm({ ...surveyForm, outcomeCategory: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="seeking_work">Actively Interviewing / Seeking Employment</option>
                <option value="further_education">Enrolled in Further Education Degree</option>
                <option value="unavailable">Temporarily Unavailable</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Any Skill or Upskilling Needs?</label>
            <input
              type="text"
              value={surveyForm.skillTrainingNeed}
              onChange={(e) => setSurveyForm({ ...surveyForm, skillTrainingNeed: e.target.value })}
              placeholder="e.g. Advanced Docker containerization, AWS certification"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSurveyModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
            >
              Submit Checkpoint Response
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TraineeDashboard;
