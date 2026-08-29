import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, analyticsAPI, authAPI } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { RoleBadge } from '../../components/RoleBadge';
import { ActionableAlerts } from '../../components/ActionableAlerts';
import { Modal } from '../../components/Modal';
import {
  Users,
  Shield,
  Activity,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  TrendingUp,
  Award,
  Link as LinkIcon,
  PieChart as PieChartIcon,
  BarChart3,
  Layers,
  Database,
  Lock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'users', 'audits'

  // Data States
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [aRes, uRes, lRes] = await Promise.all([
        analyticsAPI.getOverview(),
        adminAPI.getUsers(),
        adminAPI.getAuditLogs({ limit: 50 }),
      ]);

      if (aRes.data.success) setAnalytics(aRes.data.data);
      if (uRes.data.success) setUsers(uRes.data.data);
      if (lRes.data.success) setAuditLogs(lRes.data.data);
    } catch (err) {
      console.error('Error loading admin control center:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await adminAPI.updateUser(userId, { role: newRole });
      if (res.data.success) {
        setStatusMsg({ type: 'success', text: 'User role updated successfully!' });
        loadAdminData();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update role.' });
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const res = await adminAPI.updateUser(userId, { status: nextStatus });
      if (res.data.success) {
        setStatusMsg({ type: 'success', text: `User marked as ${nextStatus}!` });
        loadAdminData();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update status.' });
    }
  };

  const handleReseedData = async () => {
    if (!window.confirm('Reset and reseed synthetic dataset (3 programs, 5 cohorts, 10 trainees, outcomes)?')) return;
    setActionLoading(true);
    try {
      const res = await authAPI.seedDatabase();
      if (res.data.success) {
        setStatusMsg({ type: 'success', text: 'Database successfully reseeded with synthetic dataset!' });
        loadAdminData();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error reseeding database.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const res = await adminAPI.exportCsv();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `trainee_outcomes_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setStatusMsg({ type: 'success', text: 'CSV export downloaded successfully.' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to download CSV export.' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-rose-400 border-t-transparent animate-spin" />
          Loading Admin Control Center...
        </div>
      </div>
    );
  }

  const kpis = analytics?.kpis || {};

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

        {/* Top Admin Header */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <h1 className="text-2xl font-bold text-white tracking-tight">System Admin Control Center</h1>
                <RoleBadge role="admin" size="lg" />
              </div>
              <p className="text-xs text-slate-400">
                System-wide analytics KPIs, Section 22 actionable rule triggers, user RBAC management, and immutable audit logs.
              </p>
            </div>

            {/* Quick Admin Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleExportCsv}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                Export Outcome CSV
              </button>

              <button
                onClick={handleReseedData}
                disabled={actionLoading}
                className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reseed Demo Data
              </button>
            </div>
          </div>
        </div>

        {/* KPI Stats Overview (Section 21) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <StatCard
            title="Enrolled Trainees"
            value={kpis.totalEnrolled || 0}
            subtitle={`${kpis.totalCompleted || 0} Graduated`}
            icon={Users}
            color="emerald"
          />
          <StatCard
            title="Completion Rate"
            value={`${kpis.completionRate || 0}%`}
            subtitle="Completed / Enrolled"
            icon={Award}
            color="blue"
          />
          <StatCard
            title="Placement Rate"
            value={`${kpis.placementRate || 0}%`}
            subtitle="Placed in outcomes"
            icon={Activity}
            color="purple"
          />
          <StatCard
            title="3-Mo Retention"
            value={`${kpis.retentionRate3Month || 0}%`}
            subtitle="Employed @ 90-Days"
            icon={TrendingUp}
            color="cyan"
          />
          <StatCard
            title="6-Mo Retention"
            value={`${kpis.retentionRate6Month || 0}%`}
            subtitle="Employed @ 180-Days"
            icon={TrendingUp}
            color="emerald"
          />
          <StatCard
            title="Validation Rate"
            value={`${kpis.validationRate || 0}%`}
            subtitle="Employer verified"
            icon={LinkIcon}
            color="amber"
          />
        </div>

        {/* Actionable Rules Recommendations Box (Section 22 of PDF) */}
        <ActionableAlerts recommendations={analytics?.actionableRecommendations || []} />

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 space-x-4">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 text-xs font-semibold transition flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'text-rose-400 border-b-2 border-rose-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Outcome & Retention Visualizations
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-xs font-semibold transition flex items-center gap-2 ${
              activeTab === 'users'
                ? 'text-rose-400 border-b-2 border-rose-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            User & Role RBAC Management ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('audits')}
            className={`pb-3 text-xs font-semibold transition flex items-center gap-2 ${
              activeTab === 'audits'
                ? 'text-rose-400 border-b-2 border-rose-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            System Audit Trail ({auditLogs.length})
          </button>
        </div>

        {/* TAB 1: Visualizations */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Outcome Categories Distribution */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-emerald-400" />
                    Outcome Categories Distribution
                  </h3>
                  <span className="text-[11px] text-slate-400">Total: {kpis.totalCompleted} Completed</span>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.outcomeDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {analytics.outcomeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || '#10B981'} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Wage Band Progression Bracket */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    Wage Band Progression Distribution
                  </h3>
                  <span className="text-[11px] text-slate-400">Preserved Salary Brackets</span>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.wageProgressionData}>
                      <XAxis dataKey="band" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                      />
                      <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Chart 3: Top Identified Skill Gaps (Section 7.6 & 8) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  Top Identified Skill Gaps (Employer & Trainee Feedback)
                </h3>
                <span className="text-[11px] text-slate-400">Informs Curriculum Upgrades</span>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topSkillGaps} layout="vertical">
                    <XAxis type="number" stroke="#64748b" fontSize={10} allowDecimals={false} />
                    <YAxis dataKey="skill" type="category" width={180} stroke="#cbd5e1" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: User & Role RBAC Management */}
        {activeTab === 'users' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Registered Users & Role Permissions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">User Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">RBAC Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-850/50 transition">
                      <td className="py-3 px-4 font-semibold text-white">{u.name}</td>
                      <td className="py-3 px-4 text-slate-400">{u.email}</td>
                      <td className="py-3 px-4">{u.organization || '—'}</td>
                      <td className="py-3 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                        >
                          <option value="trainee">Trainee</option>
                          <option value="training_provider">Training Provider</option>
                          <option value="employer">Employer</option>
                          <option value="admin">System Admin</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleStatusToggle(u._id, u.status)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                            u.status === 'active'
                              ? 'bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white'
                              : 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white'
                          }`}
                        >
                          {u.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: System Audit Trail */}
        {activeTab === 'audits' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">System Security & Consent Audit Trail</h3>
            <p className="text-xs text-slate-400">
              Immutable record of sensitive actions (logins, consent withdrawals, completions, verifications).
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Resource</th>
                    <th className="py-3 px-4">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {auditLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-850/50 transition font-mono text-[11px]">
                      <td className="py-2.5 px-4 text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-200">{log.actorName}</td>
                      <td className="py-2.5 px-4 uppercase text-slate-400">{log.actorRole}</td>
                      <td className="py-2.5 px-4 text-emerald-400 font-semibold">{log.action}</td>
                      <td className="py-2.5 px-4 text-slate-400">{log.resourceType}</td>
                      <td className="py-2.5 px-4 text-slate-500">{log.ipAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
