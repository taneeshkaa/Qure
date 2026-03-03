import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

// ─── Attach JWT on every request ─────────────────────────────
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

// ─── Normalise error shape ────────────────────────────────────
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid — clear local session
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        const message =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            'Something went wrong';
        const err = new Error(message);
        err.status = error.response?.status;
        err.data = error.response?.data;
        return Promise.reject(err);
    }
);

export default api;
