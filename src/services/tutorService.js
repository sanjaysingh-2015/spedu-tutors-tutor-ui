import axios from 'axios'
import api from './api'

const API_BASE = import.meta.env.VITE_ADMIN_API_BASE_URL || ''

export const getSteps = () => api.get("/api/tutors/me/steps");

export const getProfile = () => api.get("/api/tutors/me");

export const createProfile = (payload) =>
  api.post("/api/tutors/me/profile", payload);

export const updateProfile = (payload) =>
  api.put("/api/tutors/me/profile", payload);


// --- Bank ---
export const getBanks = () => api.get("/api/tutors/me/bank");
export const addBank = (payload) => api.post("/api/tutors/me/bank", payload);
export const updateBank = (payload) =>
  api.put(`/api/tutors/me/bank`, payload);
export const getBank = (id) => api.get(`/api/tutors/me/bank/${id}`);
export const getPrimaryBank = (id) => api.get(`/api/tutors/me/bank-primary`);

// --- Fees ---
export const getFees = () => api.get("/api/tutors/me/fees");
export const addFee = (payload) => api.post("/api/tutors/me/fees", payload);
export const updateFee = (id, payload) =>
  api.put(`/api/tutors/me/fees/${id}`, payload);
export const getFee = (id) => api.get(`/api/tutors/me/fees/${id}`);

// --- Availability ---
export const getAvailability = () => api.get("/api/tutors/me/availability");
export const addAvailability = (payload) =>
  api.post("/api/tutors/me/availability", payload);
export const updateAvailability = (id, payload) =>
  api.put(`/api/tutors/me/availability/${id}`, payload);
export const getAvailabilityById = (id) =>
  api.get(`/api/tutors/me/availability/${id}`);

// --- Resume ---
export const uploadResume = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem('spedu_token')
    const response = await axios.post(`${API_BASE}/api/tutors/me/resume`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`
      },
    });

    return response.data.filePath; // could be file path / success message
  } catch (error) {
    console.error("Error uploading resume:", error);
    throw error;
  }
};

export const getResume = () =>
    api.get(`api/tutors/me/resume`)