import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://8.233.25.55',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDoctors = () => apiClient.get('/api/v1/doctors');
export const getMedicalServices = () => apiClient.get('/api/v1/medical-services');
export const getAppointments = () => apiClient.get('/api/v1/appointments');
export const createAppointment = (payload) => apiClient.post('/api/v1/appointments', payload);

export default apiClient;