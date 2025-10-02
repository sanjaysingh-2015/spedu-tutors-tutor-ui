import axios from 'axios'
import api from './api'

const API_BASE = import.meta.env.VITE_ADMIN_API_BASE_URL || ''

export const getProfile = () => api.get("/api/tutors/me");

export const createProfile = (payload) =>
  api.post("/api/tutors/me/profile", payload);

export const updateProfile = (payload) =>
  api.put("/api/tutors/me/profile", payload);

export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/api/tutors/me/resume", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// --- Bank ---
export const getBanks = () => api.get("/api/tutors/me/bank");
export const addBank = (payload) => api.post("/api/tutors/me/bank", payload);
export const updateBank = (id, payload) =>
  api.put(`/api/tutors/me/bank/${id}`, payload);
export const getBank = (id) => api.get(`/api/tutors/me/bank/${id}`);

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