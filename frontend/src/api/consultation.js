import api from './axios';

// ─── Doctor — get patient card for a token ───────────────────────
// Backend: GET /api/v1/doctor/patient-card/:token?doctor_id=<id>
export const getPatientCard = (tokenId, doctorId) => {
    const params = doctorId ? `?doctor_id=${doctorId}` : '';
    return api.get(`/doctor/patient-card/${tokenId}${params}`);
};

// ─── Doctor — get patient file attachments ───────────────────────
// Backend: GET /api/v1/doctor/attachments/:apptId
export const getPatientAttachments = (apptId) => api.get(`/doctor/attachments/${apptId}`);

// ─── Doctor — send prescription to chemist ───────────────────────
// Backend: POST /api/v1/doctor/prescribe
// Body: { token_id, doctor_id, prescription_text }
export const sendPrescription = (tokenId, doctorId, prescriptionText) =>
    api.post('/doctor/prescribe', { token_id: tokenId, doctor_id: doctorId, prescription_text: prescriptionText });

// ─── Chemist — get prescription queue ───────────────────────────
// Backend: GET /api/v1/chemist/queue?chemist_id=<id>
export const getChemistQueue = (chemistId) => api.get(`/chemist/queue?chemist_id=${chemistId}`);

// ─── Chemist — verify patient and deliver medicine ────────────────
// Backend: PATCH /api/v1/chemist/verify/:id
// Body: { patient_name } (anti-scam verification input)
export const verifyAndDeliver = (prescriptionId, patientName) =>
    api.patch(`/chemist/verify/${prescriptionId}`, { patient_name: patientName });
