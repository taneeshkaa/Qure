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
            console.warn('🔐 Auth token invalid or expired. Clearing localStorage.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }

        // Extract detailed error information
        const errorData = error.response?.data;
        let message =
            errorData?.message ||
            errorData?.error ||
            error.message ||
            'Something went wrong';

        // For Zod validation errors, provide detailed field-level feedback
        if (error.response?.status === 400 && errorData?.errors) {
            console.error('❌ Validation Error Details:', errorData.errors);
            const fieldErrors = Array.isArray(errorData.errors)
                ? errorData.errors.map(e => `${e.path}: ${e.message}`).join('; ')
                : errorData.errors;
            message = `Validation failed: ${fieldErrors}`;
        }

        const err = new Error(message);
        err.status = error.response?.status;
        err.data = error.response?.data;
        
        // Log full error for debugging
        console.error('🚨 API Error:', {
            status: err.status,
            message: err.message,
            data: err.data,
            requestURL: error.config?.url,
            requestMethod: error.config?.method,
            requestData: error.config?.data,
        });

        return Promise.reject(err);
    }
);

export default api;
