import api from './axios';

// ─── Hospital / Admin Login ────────────────────────────────────
// Backend: POST /api/v1/admin/login
// Returns: { status, token, data: { admin: { id, email, role } } }
export const loginHospital = (email, password) =>
    api.post('/admin/login', { email, password });

// ─── Hospital Registration (from HospitalRegistration page) ───
// Re-export for convenience
export { registerHospital, registerPatient } from './registration.js';
