import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { validationAPI, skillAPI } from '../../services/api';
import { RoleBadge } from '../../components/RoleBadge';
import { StatCard } from '../../components/StatCard';
import { Modal } from '../../components/Modal';
import {
  ShieldCheck,
  Building,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  Users,
  Briefcase,
  FileCheck,
  PlusCircle,
  Sparkles,
} from 'lucide-react';

export const EmployerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [validationRequests, setValidationRequests] = useState([]);
  const [taxonomy, setTaxonomy] = useState({});
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Verification Modal State
  const [activeRequest, setActiveRequest] = useState(null);
  const [verifyForm, setVerifyForm] = useState({
    confirmed: true,
    roleConfirmed: true,
    startDateConfirmed: true,
    wageBandConfirmed: true,
    performanceRating: 'satisfactory',
    comments: '',
    selectedCategory: 'Technical Proficiency',
    selectedSkill: '',
    skillSeverity: 'moderate',
    skillGaps: [],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [vRes, taxRes] = await Promise.all([
        validationAPI.getAll(),
        skillAPI.getTaxonomy(),
      ]);

      if (vRes.data.success) setValidationRequests(vRes.data.data);
      if (taxRes.data.success) setTaxonomy(taxRes.data.data);
    } catch (err) {
      console.error('Error loading employer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenVerifyModal = (req) => {
    setActiveRequest(req);
    const initialCategory = Object.keys(taxonomy)[0] || 'Technical Proficiency';
    setVerifyForm({
      confirmed: true,
      roleConfirmed: true,
      startDateConfirmed: true,
      wageBandConfirmed: true,
      performanceRating: 'satisfactory',
      comments: '',
      selectedCategory: initialCategory,
      selectedSkill: taxonomy[initialCategory]?.[0] || '',
      skillSeverity: 'moderate',
      skillGaps: [],
    });
  };

  const handleAddSkillTag = () => {
    if (!verifyForm.selectedSkill) return;
    const exists = verifyForm.skillGaps.some(
      (s) => s.skill === verifyForm.selectedSkill && s.category === verifyForm.selectedCategory
    );
    if (exists) return;

    setVerifyForm({
      ...verifyForm,
      skillGaps: [
        ...verifyForm.skillGaps,
        {
          category: verifyForm.selectedCategory,
          skill: verifyForm.selectedSkill,
          severity: verifyForm.skillSeverity,
          notes: verifyForm.comments || 'Identified during employer review',
        },
      ],
    });
  };

  const handleRemoveSkillTag = (index) => {
    const updated = [...verifyForm.skillGaps];
    updated.splice(index, 1);
    setVerifyForm({ ...verifyForm, skillGaps: updated });
  };

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    if (!activeRequest) return;

    try {
      const res = await validationAPI.submitToken(activeRequest.token, {
        confirmed: verifyForm.confirmed,
        roleConfirmed: verifyForm.roleConfirmed,
        startDateConfirmed: verifyForm.startDateConfirmed,
        wageBandConfirmed: verifyForm.wageBandConfirmed,
        performanceRating: verifyForm.performanceRating,
        comments: verifyForm.comments,
        skillGaps: verifyForm.skillGaps,
      });

      if (res.data.success) {
        setStatusMsg({
          type: 'success',
          text: 'Employment verification & structured skill gap feedback submitted successfully!',
        });
        setActiveRequest(null);
        loadData();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Error submitting verification.' });
    }
  };

  const pendingRequests = validationRequests.filter((r) => r.status === 'pending');
  const completedRequests = validationRequests.filter((r) => r.status === 'completed');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Status Notification */}
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

        {/* Top Employer Header */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <h1 className="text-2xl font-bold text-white tracking-tight">Employer Verification & Feedback Portal</h1>
                <RoleBadge role="employer" size="lg" />
              </div>
              <p className="text-xs text-slate-400">
                {user.organization || 'CloudScale Dynamics Inc.'} • Verify graduate hires, confirm wage bands, and provide structured skill-gap feedback.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Hired Graduates"
            value={validationRequests.length}
            subtitle="Trainees linked to your company"
            icon={Users}
            color="purple"
          />
          <StatCard
            title="Pending Validations"
            value={pendingRequests.length}
            subtitle="Requires your review"
            icon={FileCheck}
            color="amber"
          />
          <StatCard
            title="Completed Verifications"
            value={completedRequests.length}
            subtitle="Verified employment records"
            icon={ShieldCheck}
            color="emerald"
          />
        </div>

        {/* Section 1: Pending Verification Requests */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-400" />
                Pending Trainee Employment Validations
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Low-burden forms to confirm trainee role and wage bracket.
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
              {pendingRequests.length} Pending
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
              No pending validation requests. All graduate records are verified!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((req) => (
                <div key={req._id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-white">{req.traineeId?.name || 'Trainee'}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                        Needs Confirmation
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1 mb-4">
                      <div>Program: <span className="text-slate-400">{req.traineeId?.programName}</span></div>
                      <div>Reported Role: <strong className="text-emerald-400">{req.traineeId?.currentOutcome?.roleTitle || 'Engineer'}</strong></div>
                      <div>Wage Band: <span className="text-slate-300 font-mono">{req.traineeId?.currentOutcome?.wageBand || 'N/A'}</span></div>
                      <div className="text-[11px] text-slate-500">Expires: {new Date(req.expiresAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenVerifyModal(req)}
                    className="w-full py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Verify Employment & Tag Skills
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Completed Verifications History */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Verified Company Trainee History
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Trainee Name</th>
                  <th className="py-3 px-4">Role Title</th>
                  <th className="py-3 px-4">Wage Band</th>
                  <th className="py-3 px-4">Performance</th>
                  <th className="py-3 px-4">Verified Date</th>
                  <th className="py-3 px-4">Skill Gaps Tagged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {completedRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3 px-4 font-semibold text-white">{req.traineeId?.name || 'Alex Rivera'}</td>
                    <td className="py-3 px-4">{req.traineeId?.currentOutcome?.roleTitle || 'Engineer'}</td>
                    <td className="py-3 px-4 font-mono text-emerald-400">{req.traineeId?.currentOutcome?.wageBand || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                        {req.feedback?.performanceRating || 'Satisfactory'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {req.completedAt ? new Date(req.completedAt).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="py-3 px-4">
                      {req.feedback?.skillGapsIdentified?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {req.feedback.skillGapsIdentified.map((g, idx) => (
                            <span key={idx} className="bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded text-[10px]">
                              {g}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500">None flagged</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: Verify & Submit Skill Gap Assessment */}
      <Modal
        isOpen={!!activeRequest}
        onClose={() => setActiveRequest(null)}
        title={`Verify Employment: ${activeRequest?.traineeId?.name}`}
        maxWidth="max-w-2xl"
      >
        {activeRequest && (
          <form onSubmit={handleSubmitVerification} className="space-y-4 text-xs">
            {/* Minimal Privacy-Conscious Data Banner (Section 18) */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-slate-300">
              <div className="text-slate-400 text-[11px] uppercase font-semibold">Trainee Candidate Profile</div>
              <div className="font-semibold text-white text-sm">{activeRequest.traineeId?.name}</div>
              <div>Training Course: {activeRequest.traineeId?.programName} ({activeRequest.traineeId?.cohortName})</div>
              <div>Reported Role: <strong className="text-emerald-400">{activeRequest.traineeId?.currentOutcome?.roleTitle || 'Developer'}</strong></div>
              <div>Reported Wage Band: <strong className="text-emerald-400">{activeRequest.traineeId?.currentOutcome?.wageBand || '$60k-$80k'}</strong></div>
            </div>

            {/* Verification Checklist */}
            <div className="space-y-2 pt-2">
              <label className="block font-semibold text-slate-200">Employment Confirmation Checklist</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifyForm.roleConfirmed}
                    onChange={(e) => setVerifyForm({ ...verifyForm, roleConfirmed: e.target.checked })}
                    className="rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Job Role & Title is accurate</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifyForm.wageBandConfirmed}
                    onChange={(e) => setVerifyForm({ ...verifyForm, wageBandConfirmed: e.target.checked })}
                    className="rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Wage band is within range</span>
                </label>
              </div>
            </div>

            {/* Performance Rating */}
            <div>
              <label className="block font-semibold text-slate-200 mb-1">Graduate Work Performance Rating</label>
              <select
                value={verifyForm.performanceRating}
                onChange={(e) => setVerifyForm({ ...verifyForm, performanceRating: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="exceptional">🌟 Exceptional (Exceeds Expectations)</option>
                <option value="satisfactory">✅ Satisfactory (Meets Requirements)</option>
                <option value="needs_improvement">⚠️ Needs Targeted Upskilling</option>
              </select>
            </div>

            {/* Structured Skill Gap Feedback Module (Section 7.6 & 8) */}
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Structured Skill-Gap Feedback (Feeds Section 22 Rules)
                </span>
                <span className="text-[10px] text-slate-400">Optional Quality Feedback</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={verifyForm.selectedCategory}
                  onChange={(e) => {
                    const cat = e.target.value;
                    setVerifyForm({
                      ...verifyForm,
                      selectedCategory: cat,
                      selectedSkill: taxonomy[cat]?.[0] || '',
                    });
                  }}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                >
                  {Object.keys(taxonomy).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <select
                  value={verifyForm.selectedSkill}
                  onChange={(e) => setVerifyForm({ ...verifyForm, selectedSkill: e.target.value })}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                >
                  {(taxonomy[verifyForm.selectedCategory] || []).map((sk) => (
                    <option key={sk} value={sk}>
                      {sk}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddSkillTag}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold flex items-center justify-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Tag Skill Gap
                </button>
              </div>

              {/* Tagged Skills List */}
              {verifyForm.skillGaps.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {verifyForm.skillGaps.map((sg, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-purple-500/40 text-purple-300 flex items-center gap-1.5 text-[11px]"
                    >
                      <span>{sg.skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkillTag(idx)}
                        className="text-rose-400 hover:text-rose-300 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Comments */}
            <div>
              <label className="block font-semibold text-slate-200 mb-1">Employer Notes & Curriculum Recommendations</label>
              <textarea
                rows={2}
                value={verifyForm.comments}
                onChange={(e) => setVerifyForm({ ...verifyForm, comments: e.target.value })}
                placeholder="e.g. Excellent core foundation in React; suggest incorporating deeper unit testing in future cohorts."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveRequest(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow"
              >
                Submit Official Verification
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default EmployerDashboard;
