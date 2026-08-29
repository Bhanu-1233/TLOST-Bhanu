import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create Axios Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on public validation token endpoints
      if (!window.location.pathname.startsWith('/validation/')) {
        // Option to handle token expiry
      }
    }
    return Promise.reject(error);
  }
);

// API Methods
export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  seedDatabase: () => api.post('/auth/seed'),
};

export const traineeAPI = {
  getAll: (params) => api.get('/trainees', { params }),
  getById: (id) => api.get(`/trainees/${id}`),
  create: (data) => api.post('/trainees', data),
  update: (id, data) => api.put(`/trainees/${id}`, data),
  recordCompletion: (id, data) => api.post(`/trainees/${id}/complete`, data),
  updateConsent: (id, data) => api.post(`/trainees/${id}/consent`, data),
};

export const programAPI = {
  getAll: () => api.get('/programs'),
  create: (data) => api.post('/programs', data),
  addCohort: (id, data) => api.post(`/programs/${id}/cohorts`, data),
};

export const outcomeAPI = {
  record: (data) => api.post('/outcomes', data),
  getHistory: (traineeId) => api.get(`/outcomes/history/${traineeId}`),
};

export const followUpAPI = {
  getMy: () => api.get('/followups/my'),
  getAll: (params) => api.get('/followups', { params }),
  submit: (id, data) => api.post(`/followups/${id}/respond`, data),
};

export const validationAPI = {
  createRequest: (data) => api.post('/validation/request', data),
  getByToken: (token) => api.get(`/validation/token/${token}`),
  submitToken: (token, data) => api.post(`/validation/token/${token}/submit`, data),
  getAll: () => api.get('/validation'),
};

export const skillAPI = {
  getTaxonomy: () => api.get('/skills/taxonomy'),
  getAll: (params) => api.get('/skills', { params }),
  add: (data) => api.post('/skills', data),
};

export const analyticsAPI = {
  getOverview: (programId) => api.get('/analytics/overview', { params: { programId } }),
};

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  exportCsv: () => api.get('/admin/export-csv', { responseType: 'blob' }),
};

export default api;
