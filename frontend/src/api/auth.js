import api from './axios';

// ─── Patient Login ─────────────────────────────────────────────
// Backend: POST /api/v1/patient/login
export const loginPatient = (email) =>
    api.post('/patient/login', { email });

// ─── Hospital Owner Login ──────────────────────────────────────
// Backend: POST /api/v1/hospital/login
export const loginHospital = (email, password) =>
    api.post('/hospital/login', { email, password });

// ─── Admin Login ───────────────────────────────────────────────
// Backend: POST /api/v1/admin/login
export const loginAdmin = (email, password) =>
    api.post('/admin/login', { email, password });

// ─── Hospital Registration (from HospitalRegistration page) ───
export { registerHospital, registerPatient } from './registration.js';
