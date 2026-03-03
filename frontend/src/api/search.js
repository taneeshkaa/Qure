import api from './axios';

// ─── Search ────────────────────────────────────────────────────
// Backend: GET /api/v1/search?q=<keyword>
// Returns: { status, data: { doctors: [...], hospitals: [...] } }
export const searchByKeyword = (q) =>
    api.get(`/search?q=${encodeURIComponent(q)}`);

// ─── Doctor Availability ───────────────────────────────────────
// Backend: GET /api/v1/availability/:doctorId?date=YYYY-MM-DD
// Returns: { status, data: { slots: [...] } }
export const getAvailability = (doctorId, date) => {
    const params = date ? `?date=${date}` : '';
    return api.get(`/availability/${doctorId}${params}`);
};

// ─── Book Appointment ─────────────────────────────────────────
// Backend: POST /api/v1/appointments/book
// Body: { doctor_id, patient_id, appointment_date, slot_time, condition_notes }
// Returns: { status, data: { appointment: { id, token_number, ... } } }
export const bookAppointment = (data) =>
    api.post('/appointments/book', data);

// ─── Get Token Card ────────────────────────────────────────────
// Backend: GET /api/v1/appointments/:id/card
// Returns: { status, data: { appointment: { ... } } }
export const getTokenCard = (appointmentId) =>
    api.get(`/appointments/${appointmentId}/card`);
