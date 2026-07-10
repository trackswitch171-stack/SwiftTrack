import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('trackmaster_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('trackmaster_token');
            localStorage.removeItem('trackmaster_admin');
            if (window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/login')) {
                window.location.href = '/admin/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),
    me: () => api.get('/auth/me'),
    changePassword: (currentPassword: string, newPassword: string) =>
        api.post('/auth/change-password', { currentPassword, newPassword }),
};

// Shipments API
export const shipmentsApi = {
    track: (trackingNumber: string) =>
        api.get(`/shipments/track/${trackingNumber}`),
    list: (params?: Record<string, string | number>) =>
        api.get('/shipments', { params }),
    get: (id: string) => api.get(`/shipments/${id}`),
    create: (data: Record<string, unknown>) => api.post('/shipments', data),
    update: (id: string, data: Record<string, unknown>) =>
        api.put(`/shipments/${id}`, data),
    delete: (id: string) => api.delete(`/shipments/${id}`),
};

// Updates API
export const updatesApi = {
    submit: (data: Record<string, unknown>) => api.post('/updates/submit', data),
    getPending: () => api.get('/updates/pending'),
    approve: (id: string) => api.post(`/updates/approve/${id}`),
    reject: (id: string, reason?: string) =>
        api.post(`/updates/reject/${id}`, { reason }),
    addDirect: (shipmentId: string, data: Record<string, unknown>) =>
        api.post(`/updates/direct/${shipmentId}`, data),
};

// Dashboard API
export const dashboardApi = {
    stats: () => api.get('/dashboard/stats'),
    analytics: () => api.get('/dashboard/analytics'),
};

// Activity API
export const activityApi = {
    list: (params?: Record<string, string | number>) =>
        api.get('/activity', { params }),
};

export default api;
