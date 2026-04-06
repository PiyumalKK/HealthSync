import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('healthsync_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 with token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true });
        const newToken = data.token;
        localStorage.setItem('healthsync_token', newToken);
        if (data.user) {
          localStorage.setItem('healthsync_user', JSON.stringify(data.user));
        }
        api.defaults.headers.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('healthsync_token');
        localStorage.removeItem('healthsync_user');
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ===================== AUTH API =====================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (credential) => api.post('/auth/google/callback', { credential }),
  getGoogleClientId: () => api.get('/auth/google/client-id'),
  verify: () => api.get('/auth/verify'),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// ===================== DOCTORS API =====================
export const doctorsAPI = {
  getAll: (params) => api.get('/doctors', { params }),
  getPublic: (params) => api.get('/doctors/public', { params }),
  getFeatured: () => api.get('/doctors/featured'),
  getById: (id) => api.get(`/doctors/${id}`),
  getSpecializations: () => api.get('/doctors/specializations'),
  getStats: () => api.get('/doctors/stats/overview'),
  // Doctor self-management
  register: (data) => api.post('/doctors/register', data),
  getMyProfile: (userId) => api.get(`/doctors/me/${userId}`),
  updateMyProfile: (userId, data) => api.put(`/doctors/me/${userId}`, data),
  updateMySlots: (userId, slots) => api.put(`/doctors/me/${userId}/slots`, { slots }),
  // Admin
  adminGetAll: (params) => api.get('/doctors/admin/all', { params }),
  verify: (id) => api.patch(`/doctors/${id}/verify`),
};

// ===================== APPOINTMENTS API =====================
export const appointmentsAPI = {
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  getUpcoming: () => api.get('/appointments/upcoming'),
  getStats: () => api.get('/appointments/stats'),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  cancel: (id, reason) => api.patch(`/appointments/${id}/cancel`, { reason }),
  confirm: (id, notes) => api.patch(`/appointments/${id}/confirm`, { notes }),
  reject: (id, reason) => api.patch(`/appointments/${id}/reject`, { reason }),
  complete: (id, notes) => api.patch(`/appointments/${id}/complete`, { notes }),
};

// ===================== PRESCRIPTIONS API =====================
export const prescriptionsAPI = {
  getAll: (params) => api.get('/prescriptions', { params }),
  getById: (id) => api.get(`/prescriptions/${id}`),
  getStats: () => api.get('/prescriptions/stats'),
  create: (data) => api.post('/prescriptions', data),
};

// ===================== NOTIFICATIONS API =====================
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getStats: () => api.get('/notifications/stats'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
};

// ===================== REVIEWS API =====================
export const reviewsAPI = {
  getForDoctor: (doctorId, params) => api.get(`/reviews/doctor/${doctorId}`, { params }),
  create: (data) => api.post('/reviews', data),
  markHelpful: (id) => api.patch(`/reviews/${id}/helpful`),
};

export default api;
