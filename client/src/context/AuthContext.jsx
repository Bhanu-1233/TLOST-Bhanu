import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [traineeProfile, setTraineeProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and check current user on app load
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.data.success) {
            setUser(res.data.user);
            setTraineeProfile(res.data.traineeProfile || null);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Session verification failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signup = async (formData) => {
    setLoading(true);
    try {
      const res = await authAPI.signup(formData);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        
        // Fetch full profile if trainee
        if (res.data.user.role === 'trainee') {
          const meRes = await authAPI.getMe();
          setTraineeProfile(meRes.data.traineeProfile || null);
        }
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.data.message || 'Signup failed' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Signup failed';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);

        if (res.data.user.role === 'trainee') {
          const meRes = await authAPI.getMe();
          setTraineeProfile(meRes.data.traineeProfile || null);
        }
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role) => {
    const demoAccounts = {
      admin: { email: 'admin@example.com', password: 'password123' },
      training_provider: { email: 'provider@example.com', password: 'password123' },
      employer: { email: 'employer@example.com', password: 'password123' },
      trainee: { email: 'trainee@example.com', password: 'password123' },
    };

    const credentials = demoAccounts[role];
    if (!credentials) return { success: false, message: 'Invalid demo role' };
    return await login(credentials.email, credentials.password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setTraineeProfile(null);
  };

  const refreshUser = async () => {
    if (localStorage.getItem('token')) {
      try {
        const res = await authAPI.getMe();
        if (res.data.success) {
          setUser(res.data.user);
          setTraineeProfile(res.data.traineeProfile || null);
        }
      } catch (e) {
        console.error('Failed to refresh user:', e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        traineeProfile,
        token,
        loading,
        signup,
        login,
        demoLogin,
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
