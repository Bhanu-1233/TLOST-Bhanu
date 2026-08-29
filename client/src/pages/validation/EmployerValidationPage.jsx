import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { validationAPI, skillAPI } from '../../services/api';
import {
  ShieldCheck,
  Building,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Lock,
  ChevronRight,
  PlusCircle,
  XCircle,
} from 'lucide-react';

export const EmployerValidationPage = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [validationData, setValidationData] = useState(null);
  const [taxonomy, setTaxonomy] = useState({});
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [confirmed, setConfirmed] = useState(true);
  const [roleConfirmed, setRoleConfirmed] = useState(true);
  const [startDateConfirmed, setStartDateConfirmed] = useState(true);
  const [wageBandConfirmed, setWageBandConfirmed] = useState(true);
  const [performanceRating, setPerformanceRating] = useState('satisfactory');
  const [comments, setComments] = useState('');

  // Skill gaps picker
  const [selectedCategory, setSelectedCategory] = useState('Communication & Soft Skills');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [skillSeverity, setSkillSeverity] = useState('moderate');
  const [skillGaps, setSkillGaps] = useState([]);

  useEffect(() => {
    const fetchTokenData = async () => {
      setLoading(true);
      try {
        const [valRes, taxRes] = await Promise.all([
          validationAPI.getByToken(token),
          skillAPI.getTaxonomy(),
        ]);

        if (valRes.data.success) {
          setValidationData(valRes.data.data);
        }
        if (taxRes.data.success) {
          setTaxonomy(taxRes.data.data);
          const firstCat = Object.keys(taxRes.data.data)[0];
          setSelectedCategory(firstCat);
          setSelectedSkill(taxRes.data.data[firstCat]?.[0] || '');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid, expired, or completed validation link.');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchTokenData();
  }, [token]);

  const handleAddSkillTag = () => {
    if (!selectedSkill) return;
    const exists = skillGaps.some((s) => s.skill === selectedSkill && s.category === selectedCategory);
    if (exists) return;

    setSkillGaps([
      ...skillGaps,
      {
        category: selectedCategory,
        skill: selectedSkill,
        severity: skillSeverity,
        notes: comments || 'Identified in token verification',
      },
    ]);
  };

  const handleRemoveSkill = (index) => {
    const updated = [...skillGaps];
    updated.splice(index, 1);
    setSkillGaps(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await validationAPI.submitToken(token, {
        confirmed,
        roleConfirmed,
        startDateConfirmed,
        wageBandConfirmed,
        performanceRating,
        comments,
        skillGaps,
      });

      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Verification submitted successfully! Thank you.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting validation.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
          Loading Verification Request...
        </div>
      </div>
    );
  }

  if (error && !validationData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Validation Link Unavailable</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">{error}</p>
          <Link to="/" className="text-xs text-emerald-400 font-semibold hover:underline">
            Return to Portal Home
          </Link>
        </div>
      </div>
    );
  }

  const { trainee, employmentDetails, employerName, status, completedFeedback } = validationData || {};

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Secure Banner */}
        <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Secure Direct Employer Verification (Section 20 Protocol)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Privacy-Preserving Form</span>
        </div>

        {/* Success Message Card */}
        {successMsg ? (
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Verification Confirmed!</h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Thank you, {employerName || 'Employer Partner'}. Your verification and skill-gap feedback have been securely
              recorded into the trainee's longitudinal outcome record and provider dashboard.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow"
            >
              <span>Back to Portal</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" />
                Employer Outcome Verification
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Confirm Employment for {trainee?.name || 'Graduate'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Presented to {employerName || 'Hiring Partner'}. Please confirm the reported role and wage bracket.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* Minimal Trainee Info */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-slate-300">
                <div className="text-[11px] font-semibold uppercase text-slate-400">Reported Details</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500">Candidate:</span> <strong className="text-white">{trainee?.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Training Course:</span> {trainee?.programName}
                  </div>
                  <div>
                    <span className="text-slate-500">Reported Role:</span> <strong className="text-emerald-400">{employmentDetails?.roleTitle || 'Developer'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Wage Bracket:</span> <span className="text-emerald-400 font-mono">{employmentDetails?.wageBand || 'Not Disclosed'}</span>
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-2 pt-2">
                <label className="block font-semibold text-slate-200">Confirmation Checklist</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                    <input
                      type="checkbox"
                      checked={roleConfirmed}
                      onChange={(e) => setRoleConfirmed(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                    />
                    <span>I confirm this trainee is employed in this role/capacity at our organization.</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                    <input
                      type="checkbox"
                      checked={wageBandConfirmed}
                      onChange={(e) => setWageBandConfirmed(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                    />
                    <span>I confirm the wage band bracket is accurate without disclosing exact salary.</span>
                  </label>
                </div>
              </div>

              {/* Overall Performance */}
              <div>
                <label className="block font-semibold text-slate-200 mb-1">Graduate Work Performance</label>
                <select
                  value={performanceRating}
                  onChange={(e) => setPerformanceRating(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="exceptional">🌟 Exceptional (Exceeds Job Requirements)</option>
                  <option value="satisfactory">✅ Satisfactory (Meets Expectations)</option>
                  <option value="needs_improvement">⚠️ Needs Targeted Upskilling / Support</option>
                </select>
              </div>

              {/* Structured Skill Gaps Picker (Section 7.6 & 8) */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Structured Skill Gap Feedback
                  </span>
                  <span className="text-[10px] text-slate-400">Curriculum Feedback</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      const cat = e.target.value;
                      setSelectedCategory(cat);
                      setSelectedSkill(taxonomy[cat]?.[0] || '');
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
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  >
                    {(taxonomy[selectedCategory] || []).map((sk) => (
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
                    Add Tag
                  </button>
                </div>

                {skillGaps.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {skillGaps.map((sg, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-purple-500/40 text-purple-300 flex items-center gap-1.5 text-[11px]"
                      >
                        <span>{sg.skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(idx)}
                          className="text-rose-400 hover:text-rose-300 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Employer Feedback Comments */}
              <div>
                <label className="block font-semibold text-slate-200 mb-1">Constructive Feedback Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="e.g. Trainee adapted quickly to team standups. Suggesting extra focus on testing in curriculum."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                Submit Employer Verification
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerValidationPage;
