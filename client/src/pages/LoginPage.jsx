import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogIn,
  Mail,
  Lock,
  Sparkles,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  User,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export const LoginPage = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (res.user.role === 'admin') navigate('/admin');
      else if (res.user.role === 'training_provider') navigate('/provider');
      else if (res.user.role === 'employer') navigate('/employer');
      else navigate('/trainee');
    } else {
      setError(res.message || 'Invalid credentials.');
    }
  };

  const handleDemo = async (role) => {
    setLoading(true);
    const res = await demoLogin(role);
    setLoading(false);

    if (res.success) {
      if (role === 'admin') navigate('/admin');
      else if (role === 'training_provider') navigate('/provider');
      else if (role === 'employer') navigate('/employer');
      else navigate('/trainee');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
      <div className="max-w-md w-full space-y-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-400">
              <LogIn className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Portal Sign In</h2>
            <p className="text-xs text-slate-400 mt-1">
              Sign in with your role-based account or use quick demo access below.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com / trainee@example.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-emerald-400 hover:underline font-medium">
              Sign up with role
            </Link>
          </div>
        </div>

        {/* Quick 1-Click Demo Login Box */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            1-Click Demo Personas
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleDemo('trainee')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-emerald-500/30 text-left transition flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">Trainee</div>
                <div className="text-[10px] text-slate-400">Alex Rivera</div>
              </div>
            </button>

            <button
              onClick={() => handleDemo('training_provider')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-blue-500/30 text-left transition flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">Provider</div>
                <div className="text-[10px] text-slate-400">Elena Rostova</div>
              </div>
            </button>

            <button
              onClick={() => handleDemo('employer')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-purple-500/30 text-left transition flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">Employer</div>
                <div className="text-[10px] text-slate-400">Marcus Vance</div>
              </div>
            </button>

            <button
              onClick={() => handleDemo('admin')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-rose-500/30 text-left transition flex items-center gap-2"
            >
              <User className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">Admin</div>
                <div className="text-[10px] text-slate-400">System Admin</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
