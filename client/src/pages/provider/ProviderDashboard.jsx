import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  traineeAPI,
  programAPI,
  validationAPI,
  followUpAPI,
  skillAPI,
  analyticsAPI,
} from '../../services/api';
import { RoleBadge } from '../../components/RoleBadge';
import { StatCard } from '../../components/StatCard';
import { Modal } from '../../components/Modal';
import { TimelineView } from '../../components/TimelineView';
import {
  Briefcase,
  Users,
  GraduationCap,
  Award,
  Link as LinkIcon,
  Search,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  Eye,
  AlertCircle,
  ExternalLink,
  Copy,
  Layers,
  Sparkles,
} from 'lucide-react';

export const ProviderDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trainees'); // 'trainees', 'programs', 'validations', 'followups'

  // Data States
  const [trainees, setTrainees] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [validationRequests, setValidationRequests] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterProgram, setFilterProgram] = useState('');
  const [filterOutcome, setFilterOutcome] = useState('');

  // Modals
  const [traineeModalOpen, setTraineeModalOpen] = useState(false);
  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [selectedTraineeTimeline, setSelectedTraineeTimeline] = useState(null);
  const [generatedLinkInfo, setGeneratedLinkInfo] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Forms
  const [newTraineeForm, setNewTraineeForm] = useState({
    name: '',
    email: '',
    phone: '',
    programId: '',
    cohortName: 'Cohort 2026-A',
  });

  const [newProgramForm, setNewProgramForm] = useState({
    name: '',
    code: '',
    skillArea: 'Software Development',
    durationWeeks: 12,
    description: '',
  });

  const [validationForm, setValidationForm] = useState({
    traineeId: '',
    employerEmail: '',
    employerName: '',
    expiresInDays: 14,
  });

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [tRes, pRes, vRes, fRes, aRes] = await Promise.all([
        traineeAPI.getAll({ search, programId: filterProgram, outcome: filterOutcome }),
        programAPI.getAll(),
        validationAPI.getAll(),
        followUpAPI.getAll(),
        analyticsAPI.getOverview(),
      ]);

      if (tRes.data.success) setTrainees(tRes.data.data);
      if (pRes.data.success) setPrograms(pRes.data.data);
      if (vRes.data.success) setValidationRequests(vRes.data.data);
      if (fRes.data.success) setFollowUps(fRes.data.data);
      if (aRes.data.success) setAnalytics(aRes.data.data);
    } catch (err) {
      console.error('Error loading provider dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [search, filterProgram, filterOutcome]);

  const handleCreateTrainee = async (e) => {
    e.preventDefault();
    try {
      const res = await traineeAPI.create(newTraineeForm);
      if (res.data.success) {
        setStatusMsg({ type: 'success', text: 'Trainee registered & consent record initialized!' });
        setTraineeModalOpen(false);
        setNewTraineeForm({ name: '', email: '', phone: '', programId: '', cohortName: 'Cohort 2026-A' });
        loadAllData();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create trainee.' });
    }
  };

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    try {
      const res = await programAPI.create(newProgramForm);
      if (res.data.success) {
        setStatusMsg({ type: 'success', text: 'Training Program created successfully!' });
        setProgramModalOpen(false);
        setNewProgramForm({ name: '', code: '', skillArea: 'Software Development', durationWeeks: 12, description: '' });
        loadAllData();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create program.' });
    }
  };

  const handleRecordCompletion = async (traineeId) => {
    try {
      const res = await traineeAPI.recordCompletion(traineeId, { completionDate: new Date() });
      if (res.data.success) {
        setStatusMsg({
          type: 'success',
          text: 'Training completion recorded! 30-, 90-, and 180-day follow-ups scheduled automatically.',
        });
        loadAllData();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Error recording completion.' });
    }
  };

  const handleOpenValidationModal = (trainee) => {
    setValidationForm({
      traineeId: trainee._id,
      employerEmail: trainee.currentOutcome?.employerEmail || 'employer@example.com',
      employerName: trainee.currentOutcome?.employerName || 'Partner Employer',
      expiresInDays: 14,
    });
    setValidationModalOpen(true);
  };

  const handleCreateValidationRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await validationAPI.createRequest(validationForm);
      if (res.data.success) {
        setGeneratedLinkInfo({
          link: `${window.location.origin}${res.data.validationLink}`,
          token: res.data.data.token,
          employer: validationForm.employerName,
        });
        setStatusMsg({ type: 'success', text: 'Secure time-limited employer validation link generated!' });
        setValidationModalOpen(false);
        loadAllData();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to generate validation link.' });
    }
  };

  const handleViewTimeline = async (traineeId) => {
    try {
      const res = await traineeAPI.getById(traineeId);
      if (res.data.success) {
        setSelectedTraineeTimeline(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching trainee timeline:', err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setStatusMsg({ type: 'success', text: 'Validation URL copied to clipboard!' });
  };

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

        {/* Top Header Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <h1 className="text-2xl font-bold text-white tracking-tight">Training Provider Management Portal</h1>
                <RoleBadge role="training_provider" size="lg" />
              </div>
              <p className="text-xs text-slate-400">
                {user.organization || 'Apex Vocational & Tech Institute'} • Longitudinal cohort monitoring & employer validation dispatch.
              </p>
            </div>

            {/* Top Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setTraineeModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                Register Trainee
              </button>
              <button
                onClick={() => setProgramModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/20 flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                New Program
              </button>
            </div>
          </div>
        </div>

        {/* Generated Validation Link Banner (if just created) */}
        {generatedLinkInfo && (
          <div className="p-5 rounded-2xl bg-purple-950/40 border border-purple-500/40 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Secure Employer Validation Link Generated for {generatedLinkInfo.employer}
              </div>
              <button onClick={() => setGeneratedLinkInfo(null)} className="text-xs text-purple-400 hover:underline">
                Close
              </button>
            </div>
            <p className="text-xs text-slate-300">
              Share this link directly with the hiring employer to collect employment confirmation and structured skill gap tags:
            </p>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                readOnly
                value={generatedLinkInfo.link}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400"
              />
              <button
                onClick={() => copyToClipboard(generatedLinkInfo.link)}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Link
              </button>
              <a
                href={generatedLinkInfo.link}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open
              </a>
            </div>
          </div>
        )}

        {/* Stat Cards */}
        {analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Trainees Enrolled"
              value={analytics.kpis.totalEnrolled}
              subtitle={`${analytics.kpis.totalCompleted} Completed`}
              icon={Users}
              color="emerald"
            />
            <StatCard
              title="Completion Rate"
              value={`${analytics.kpis.completionRate}%`}
              subtitle="Course graduation benchmark"
              icon={GraduationCap}
              color="blue"
              trend="+4.2%"
            />
            <StatCard
              title="Placement & Outcome Rate"
              value={`${analytics.kpis.placementRate}%`}
              subtitle={`${analytics.kpis.totalPlaced} Placed or Self-Employed`}
              icon={Briefcase}
              color="purple"
            />
            <StatCard
              title="Employer Validation Rate"
              value={`${analytics.kpis.validationRate}%`}
              subtitle={`${analytics.kpis.completedValidations} / ${analytics.kpis.totalValidationRequests} Confirmed`}
              icon={LinkIcon}
              color="cyan"
            />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 space-x-4">
          <button
            onClick={() => setActiveTab('trainees')}
            className={`pb-3 text-xs font-semibold transition flex items-center gap-2 ${
              activeTab === 'trainees'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Trainee Directory & Timeline ({trainees.length})
          </button>

          <button
            onClick={() => setActiveTab('programs')}
            className={`pb-3 text-xs font-semibold transition flex items-center gap-2 ${
              activeTab === 'programs'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Programs & Cohorts ({programs.length})
          </button>

          <button
            onClick={() => setActiveTab('validations')}
            className={`pb-3 text-xs font-semibold transition flex items-center gap-2 ${
              activeTab === 'validations'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            Validation Requests ({validationRequests.length})
          </button>

          <button
            onClick={() => setActiveTab('followups')}
            className={`pb-3 text-xs font-semibold transition flex items-center gap-2 ${
              activeTab === 'followups'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            Follow-up Queue ({followUps.length})
          </button>
        </div>

        {/* TAB 1: Trainee Directory & Timelines */}
        {activeTab === 'trainees' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search trainee, employer, role..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={filterProgram}
                onChange={(e) => setFilterProgram(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="">All Training Programs</option>
                {programs.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>

              <select
                value={filterOutcome}
                onChange={(e) => setFilterOutcome(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="">All Outcomes</option>
                <option value="employed">Employed</option>
                <option value="self_employed">Self-Employed</option>
                <option value="apprentice">Apprentice</option>
                <option value="seeking_work">Seeking Work</option>
                <option value="further_education">Further Education</option>
              </select>
            </div>

            {/* Trainees Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Trainee</th>
                    <th className="py-3 px-4">Program & Cohort</th>
                    <th className="py-3 px-4">Training Status</th>
                    <th className="py-3 px-4">Current Outcome</th>
                    <th className="py-3 px-4">Wage Band</th>
                    <th className="py-3 px-4">Verification</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {trainees.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-850/50 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{t.name}</div>
                        <div className="text-[11px] text-slate-400">{t.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-200">{t.programName || 'General Program'}</div>
                        <div className="text-[11px] text-slate-500">{t.cohortName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            t.trainingStatus === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {t.trainingStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200 capitalize">
                          {t.currentOutcome?.category ? t.currentOutcome.category.replace('_', ' ') : 'Seeking Work'}
                        </div>
                        {t.currentOutcome?.roleTitle && (
                          <div className="text-[11px] text-slate-400">
                            {t.currentOutcome.roleTitle} @ {t.currentOutcome.employerName}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-400">
                        {t.currentOutcome?.wageBand || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            t.currentOutcome?.verificationStatus === 'employer_verified'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {t.currentOutcome?.verificationStatus ? t.currentOutcome.verificationStatus.replace('_', ' ') : 'Not Verified'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => handleViewTimeline(t._id)}
                          title="View Complete Longitudinal Timeline"
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Timeline
                        </button>

                        {t.trainingStatus !== 'completed' ? (
                          <button
                            onClick={() => handleRecordCompletion(t._id)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-medium transition"
                          >
                            Mark Completed
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenValidationModal(t)}
                            title="Generate Secure Employer Validation Link"
                            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition inline-flex items-center gap-1 shadow"
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                            Request Validation
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Programs and Cohorts */}
        {activeTab === 'programs' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {programs.map((p) => (
              <div key={p._id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {p.code}
                    </span>
                    <span className="text-xs text-slate-400">{p.durationWeeks} Weeks</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{p.name}</h3>
                  <p className="text-xs text-slate-400 mb-3">{p.skillArea}</p>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">{p.description}</p>

                  <div className="border-t border-slate-800 pt-3 mb-4 space-y-2">
                    <span className="text-[11px] font-semibold uppercase text-slate-400">Cohorts ({p.cohorts?.length || 0})</span>
                    <div className="space-y-1">
                      {p.cohorts?.map((c, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs bg-slate-950 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-200">{c.name}</span>
                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${c.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                            {c.active ? 'Active' : 'Archived'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
                  <span>Enrolled: <strong className="text-white">{p.totalTrainees || 0}</strong></span>
                  <span>Graduated: <strong className="text-emerald-400">{p.completedTrainees || 0}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: Validation Requests */}
        {activeTab === 'validations' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Employer Validation Tokens</h3>
                <p className="text-xs text-slate-400">Time-limited verification links generated for employers (Section 20).</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Trainee</th>
                    <th className="py-3 px-4">Employer Organization</th>
                    <th className="py-3 px-4">Employer Email</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Expires</th>
                    <th className="py-3 px-4 text-right">Link Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {validationRequests.map((vr) => {
                    const fullLink = `${window.location.origin}/validation/${vr.token}`;
                    return (
                      <tr key={vr._id} className="hover:bg-slate-850/50 transition">
                        <td className="py-3 px-4 font-semibold text-white">{vr.traineeId?.name || 'Trainee'}</td>
                        <td className="py-3 px-4">{vr.employerName}</td>
                        <td className="py-3 px-4 text-slate-400">{vr.employerEmail}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              vr.status === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {vr.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          {new Date(vr.expiresAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => copyToClipboard(fullLink)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px]"
                          >
                            Copy Link
                          </button>
                          <a
                            href={fullLink}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 rounded bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white text-[11px] inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Open
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Follow-up Queue */}
        {activeTab === 'followups' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Scheduled & Completed Micro-Surveys</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Trainee</th>
                    <th className="py-3 px-4">Checkpoint</th>
                    <th className="py-3 px-4">Scheduled Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Reported Working</th>
                    <th className="py-3 px-4">Wage Band</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {followUps.map((fu) => (
                    <tr key={fu._id} className="hover:bg-slate-850/50 transition">
                      <td className="py-3 px-4 font-semibold text-white">{fu.traineeId?.name || 'Trainee'}</td>
                      <td className="py-3 px-4 font-mono uppercase text-emerald-400">{fu.checkpointType?.replace('_', ' ')}</td>
                      <td className="py-3 px-4 text-slate-400">{new Date(fu.scheduledAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          fu.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {fu.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {fu.responses?.working !== undefined ? (fu.responses.working ? 'Yes' : 'No') : '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-400">
                        {fu.responses?.wageBand || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Register Trainee */}
      <Modal isOpen={traineeModalOpen} onClose={() => setTraineeModalOpen(false)} title="Register New Trainee">
        <form onSubmit={handleCreateTrainee} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={newTraineeForm.name}
              onChange={(e) => setNewTraineeForm({ ...newTraineeForm, name: e.target.value })}
              placeholder="e.g. Maya Lin"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={newTraineeForm.email}
                onChange={(e) => setNewTraineeForm({ ...newTraineeForm, email: e.target.value })}
                placeholder="maya.lin@example.org"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone (Optional)</label>
              <input
                type="tel"
                value={newTraineeForm.phone}
                onChange={(e) => setNewTraineeForm({ ...newTraineeForm, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Program</label>
              <select
                value={newTraineeForm.programId}
                onChange={(e) => setNewTraineeForm({ ...newTraineeForm, programId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="">Select Training Program</option>
                {programs.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Cohort Batch Name</label>
              <input
                type="text"
                value={newTraineeForm.cohortName}
                onChange={(e) => setNewTraineeForm({ ...newTraineeForm, cohortName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setTraineeModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
            >
              Register Trainee
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Create Program */}
      <Modal isOpen={programModalOpen} onClose={() => setProgramModalOpen(false)} title="Create Training Program">
        <form onSubmit={handleCreateProgram} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Program Title</label>
              <input
                type="text"
                value={newProgramForm.name}
                onChange={(e) => setNewProgramForm({ ...newProgramForm, name: e.target.value })}
                placeholder="e.g. Cloud & DevOps Engineering"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Code</label>
              <input
                type="text"
                value={newProgramForm.code}
                onChange={(e) => setNewProgramForm({ ...newProgramForm, code: e.target.value })}
                placeholder="CDEV-2026"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Skill Area Domain</label>
              <input
                type="text"
                value={newProgramForm.skillArea}
                onChange={(e) => setNewProgramForm({ ...newProgramForm, skillArea: e.target.value })}
                placeholder="e.g. Cloud Architecture, AWS, Kubernetes"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Duration (Weeks)</label>
              <input
                type="number"
                value={newProgramForm.durationWeeks}
                onChange={(e) => setNewProgramForm({ ...newProgramForm, durationWeeks: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                min={1}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Curriculum Summary</label>
            <textarea
              rows={2}
              value={newProgramForm.description}
              onChange={(e) => setNewProgramForm({ ...newProgramForm, description: e.target.value })}
              placeholder="Detailed description of curriculum..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setProgramModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
            >
              Create Program
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Generate Validation Request */}
      <Modal isOpen={validationModalOpen} onClose={() => setValidationModalOpen(false)} title="Generate Employer Validation Link">
        <form onSubmit={handleCreateValidationRequest} className="space-y-4">
          <p className="text-xs text-slate-400">
            Creates a secure, time-limited token link for the employer to confirm employment fields and submit skill-gap tags (Section 20).
          </p>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Employer Organization Name</label>
            <input
              type="text"
              value={validationForm.employerName}
              onChange={(e) => setValidationForm({ ...validationForm, employerName: e.target.value })}
              placeholder="e.g. NextGen Fintech Labs"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Employer Contact Email</label>
            <input
              type="email"
              value={validationForm.employerEmail}
              onChange={(e) => setValidationForm({ ...validationForm, employerEmail: e.target.value })}
              placeholder="hr@nextgenfintech.io"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Link Expiration (Days)</label>
            <input
              type="number"
              value={validationForm.expiresInDays}
              onChange={(e) => setValidationForm({ ...validationForm, expiresInDays: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              min={1}
              max={60}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setValidationModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs"
            >
              Generate Link
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Trainee Complete Longitudinal Timeline */}
      <Modal
        isOpen={!!selectedTraineeTimeline}
        onClose={() => setSelectedTraineeTimeline(null)}
        title={`Longitudinal Journey: ${selectedTraineeTimeline?.trainee?.name}`}
        maxWidth="max-w-3xl"
      >
        {selectedTraineeTimeline && (
          <TimelineView
            trainee={selectedTraineeTimeline.trainee}
            consent={selectedTraineeTimeline.consent}
            employmentRecords={selectedTraineeTimeline.employmentRecords || []}
            followUps={selectedTraineeTimeline.followUps || []}
            validationRequests={selectedTraineeTimeline.validationRequests || []}
            skillGaps={selectedTraineeTimeline.skillGaps || []}
          />
        )}
      </Modal>
    </div>
  );
};

export default ProviderDashboard;
