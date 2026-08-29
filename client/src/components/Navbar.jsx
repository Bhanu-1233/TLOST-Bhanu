import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from './RoleBadge';
import {
  Activity,
  LogOut,
  User,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Sparkles,
  ChevronDown,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, demoLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleDemoSwitch = async (role) => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    const res = await demoLogin(role);
    if (res.success) {
      if (role === 'admin') navigate('/admin');
      else if (role === 'training_provider') navigate('/provider');
      else if (role === 'employer') navigate('/employer');
      else if (role === 'trainee') navigate('/trainee');
    }
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'training_provider':
        return '/provider';
      case 'employer':
        return '/employer';
      case 'trainee':
        return '/trainee';
      default:
        return '/login';
    }
  };

  return (
    <nav className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Title */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                  Trainee Outcome Tracker
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                    MVP
                  </span>
                </span>
                <span className="block text-[11px] text-slate-400">Longitudinal Outcome Portal</span>
              </div>
            </Link>
          </div>

          {/* Center Navigation links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                location.pathname === '/'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Overview
            </Link>

            {isAuthenticated && (
              <Link
                to={getDashboardPath(user.role)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin') ||
                  location.pathname.startsWith('/provider') ||
                  location.pathname.startsWith('/employer') ||
                  location.pathname.startsWith('/trainee')
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                My Portal
              </Link>
            )}
          </div>

          {/* Right Action Items */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Demo Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Role Portals</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 space-y-1">
                  <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Switch Test Persona
                  </div>
                  <button
                    onClick={() => handleDemoSwitch('trainee')}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs flex items-center justify-between text-slate-200"
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-semibold text-slate-100">Trainee Portal</div>
                        <div className="text-[10px] text-slate-400">Alex Rivera (Follow-ups & Outcomes)</div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('training_provider')}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs flex items-center justify-between text-slate-200"
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-400" />
                      <div>
                        <div className="font-semibold text-slate-100">Training Provider</div>
                        <div className="text-[10px] text-slate-400">Elena (Cohorts & Validations)</div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('employer')}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs flex items-center justify-between text-slate-200"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      <div>
                        <div className="font-semibold text-slate-100">Employer Portal</div>
                        <div className="text-[10px] text-slate-400">Marcus Vance (Skill Gap Feedback)</div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('admin')}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs flex items-center justify-between text-slate-200"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-rose-400" />
                      <div>
                        <div className="font-semibold text-slate-100">System Admin</div>
                        <div className="text-[10px] text-slate-400">KPIs, Audit Logs, Rule Engine</div>
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
                <div className="text-right">
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5 justify-end">
                    {user.name}
                    <RoleBadge role={user.role} />
                  </div>
                  <div className="text-[11px] text-slate-400">{user.email}</div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  title="Logout"
                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition"
                >
                  Sign Up (Axios)
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-3">
          {isAuthenticated ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-sm font-semibold text-white">{user.name}</span>
                <RoleBadge role={user.role} />
              </div>
              <Link
                to={getDashboardPath(user.role)}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium"
              >
                Go to Dedicated Portal
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full text-left px-3 py-2 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-medium"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg bg-slate-800 text-xs font-medium text-slate-200 text-center"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg bg-emerald-600 text-xs font-semibold text-white text-center"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
