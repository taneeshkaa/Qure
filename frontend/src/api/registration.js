import api from './axios';

// ─── Location cascading ───────────────────────────────────────
// Backend: GET /api/v1/locations/states
export const fetchStates = () => api.get('/locations/states');

// Backend: GET /api/v1/locations/cities?state=<stateName>
export const fetchCities = (stateName) => api.get(`/locations/cities?state=${encodeURIComponent(stateName)}`);

// Backend: GET /api/v1/locations/hospitals?city=<cityName>
export const fetchHospitalsByCity = (cityName) => api.get(`/locations/hospitals?city=${encodeURIComponent(cityName)}`);

// ─── Registration ─────────────────────────────────────────────
// Backend: POST /api/v1/register/hospital
export const registerHospital = (data) => api.post('/register/hospital', data);

// Backend: POST /api/v1/patient/register
export const registerPatient = (data) => api.post('/patient/register', data);

// ─── Doctor Self-Registration ─────────────────────────────────
// Backend: GET /api/v1/doctor/hospitals/:hospitalId/unregistered-doctors
export const fetchUnregisteredDoctors = (hospitalId) =>
    api.get(`/doctor/hospitals/${hospitalId}/unregistered-doctors`);

// Backend: POST /api/v1/doctor/register
export const registerDoctor = (data) => api.post('/doctor/register', data);
