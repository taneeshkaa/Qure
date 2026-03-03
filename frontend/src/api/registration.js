import api from './axios';

// ─── Location cascading ───────────────────────────────────────
export const fetchStates = () => api.get('/location/states');
export const fetchCities = (stateId) => api.get(`/location/cities/${stateId}`);
export const fetchHospitals = (cityId) => api.get(`/location/hospitals/${cityId}`);

// ─── Registration ─────────────────────────────────────────────
export const registerHospital = (data) => api.post('/auth/register/hospital', data);
export const registerPatient = (data) => api.post('/auth/register/patient', data);
