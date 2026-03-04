import api from './axios';

// POST /api/v1/hospital/login
export const loginHospital = (email, password) =>
    api.post('/hospital/login', { email, password });

// GET /api/v1/hospital/profile
export const getHospitalProfile = () =>
    api.get('/hospital/profile');

// PUT /api/v1/hospital/profile
export const updateHospitalProfile = (data) =>
    api.put('/hospital/profile', data);

// GET /api/v1/hospital/doctors
export const getHospitalDoctors = () =>
    api.get('/hospital/doctors');

// POST /api/v1/hospital/doctors
export const addHospitalDoctor = (data) =>
    api.post('/hospital/doctors', data);

// DELETE /api/v1/hospital/doctors/:id
export const removeHospitalDoctor = (id) =>
    api.delete(`/hospital/doctors/${id}`);
