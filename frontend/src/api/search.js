import api from './axios';

// ─── Search ────────────────────────────────────────────────────
// Backend: GET /api/v1/search?q=<keyword>
// Returns: { status, data: { doctors: [...], hospitals: [...] } }
export const searchByKeyword = (q) =>
    api.get(`/search?q=${encodeURIComponent(q)}`);

// ─── Get All Doctors (Patient-facing browse page) ─────────────
// Backend: GET /api/v1/doctors
// Optional: ?specialty=Neurologist
export const getAllDoctors = (specialty) => {
    const params = specialty ? `?specialty=${encodeURIComponent(specialty)}` : '';
    return api.get(`/doctors${params}`);
};

// ─── Get Doctor by ID ──────────────────────────────────────────
// Backend: GET /api/v1/doctors/:id
export const getDoctorByIdAPI = (id) =>
    api.get(`/doctors/${id}`);

// ─── Get Doctor by Slug ────────────────────────────────────────
// Backend: GET /api/v1/doctors/slug/:slug
// Fetches doctor using URL-friendly slug (e.g., "dr-priya-mehta")
export const getDoctorBySlugAPI = (slug) =>
    api.get(`/doctors/slug/${slug}`);

// ─── Get All Hospitals (Patient-facing browse page) ──────────
// Backend: GET /api/v1/locations/all-hospitals
// Optional: ?state=Maharashtra or ?specialty=Neurology
export const getAllHospitals = (state, specialty) => {
    const params = new URLSearchParams();
    if (state) params.append('state', state);
    if (specialty) params.append('specialty', specialty);
    const queryString = params.toString();
    return api.get(`/locations/all-hospitals${queryString ? '?' + queryString : ''}`);
};

// ─── Get Hospital by ID ──────────────────────────────────────
// Backend: GET /api/v1/locations/hospitals/:id
export const getHospitalByIdAPI = (id) =>
    api.get(`/locations/hospitals/${id}`);

// ─── Doctor Availability ───────────────────────────────────────
// Backend: GET /api/v1/availability/:doctorId?date=YYYY-MM-DD
// Returns: { status, data: { slots: [...] } }
export const getAvailability = (doctorId, date) => {
    const params = date ? `?date=${date}` : '';
    return api.get(`/availability/${doctorId}${params}`);
};

// ─── Book Appointment ─────────────────────────────────────────
// Backend: POST /api/v1/appointments/book
// Body: { doctor_id, patient_id, date (YYYY-MM-DD), slot (HH:MM), problem_description }
// Returns: { status, data: { appointment: { id, token_number, ... } } }
export const bookAppointment = (data) =>
    api.post('/appointments/book', data);

// ─── Cancel Appointment ──────────────────────────────────────
// Backend: PATCH /api/v1/appointments/:id/cancel
export const cancelAppointmentAPI = (id) =>
    api.patch(`/appointments/${id}/cancel`);
// Returns: { status, data: { appointment: { ... } } }
export const getTokenCard = (appointmentId) =>
    api.get(`/appointments/${appointmentId}/card`);

// ─── Get Patient's Appointments ────────────────────────────────
// Backend: GET /api/v1/appointments/my (requires auth)
// Returns: { status, results: number, data: [...] }
export const getMyAppointments = () =>
    api.get('/appointments/my');
