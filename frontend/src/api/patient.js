import api from './axios';

// ─── Live Queue ────────────────────────────────────────────────
// Backend: GET /api/v1/patient/queue/active
export const getActiveQueueToken = () => api.get('/patient/queue/active');

// ─── Medical Timeline ──────────────────────────────────────────
// Backend: GET /api/v1/patient/timeline
export const getPatientTimeline = () => api.get('/patient/timeline');

// ─── Health Profile ────────────────────────────────────────────
// Backend: GET/PUT /api/v1/patient/health-profile
export const getHealthProfile = () => api.get('/patient/health-profile');
export const updateHealthProfile = (data) => api.put('/patient/health-profile', data);

// ─── Medication Reminders ──────────────────────────────────────
// Backend: GET/POST /api/v1/patient/reminders
// Backend: PATCH     /api/v1/patient/reminders/:id
export const getMedicationReminders = () => api.get('/patient/reminders');
export const createMedicationReminder = (data) => api.post('/patient/reminders', data);
export const patchMedicationReminder = (id, data) => api.patch(`/patient/reminders/${id}`, data);

// ─── Patient Dashboard (Phase 6) ───────────────────────────────
export const getDashboardStatus = () => api.get('/patient/dashboard/status');
export const getDashboardStats = () => api.get('/patient/dashboard/stats');
export const getDashboardRecommendations = () => api.get('/patient/dashboard/recommendations');
export const getDashboardActivity = () => api.get('/patient/dashboard/activity');
export const getDashboardAnalytics = () => api.get('/patient/dashboard/analytics');
export const getDashboardLastAction = () => api.get('/patient/dashboard/last-action');

// ─── Nearby Hospitals ──────────────────────────────────────────
export const getNearbyHospitals = () => api.get('/hospitals/nearby');

