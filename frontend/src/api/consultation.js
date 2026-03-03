import api from './axios';

// ─── Doctor — get queued tokens ──────────────────────────────────
export const getDoctorQueue = (doctorId) => api.get(`/doctor/queue/${doctorId}`);

// ─── Doctor — get patient card for a token ───────────────────────
export const getPatientCard = (tokenId) => api.get(`/doctor/patient-card/${tokenId}`);

// ─── Doctor — send prescription to chemist ───────────────────────
export const sendPrescription = (tokenId, prescriptionText) =>
    api.post('/doctor/prescription', { tokenId, prescriptionText });

// ─── Doctor — mark token as complete ─────────────────────────────
export const completeToken = (tokenId) => api.patch(`/doctor/token/${tokenId}/complete`);

// ─── Chemist — get prescription queue ───────────────────────────
export const getChemistQueue = (hospitalId) => api.get(`/chemist/queue/${hospitalId}`);

// ─── Chemist — update prescription status ───────────────────────
export const updatePrescriptionStatus = (prescriptionId, status) =>
    api.patch(`/chemist/prescription/${prescriptionId}/status`, { status });

// ─── Chemist — verify patient identity (reveal name/phone) ───────
export const verifyPatient = (prescriptionId) =>
    api.get(`/chemist/prescription/${prescriptionId}/verify`);
