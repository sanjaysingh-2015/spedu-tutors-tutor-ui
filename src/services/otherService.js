import axios from 'axios'
import api from './api'

const API_BASE = import.meta.env.VITE_ADMIN_API_BASE_URL || '';

// --- Bank ---
export const getBankDetails = () => api.get("/api/banks");
export const searchBankDetails = (param) => api.get(`/api/banks/search?${param}`);

export const createBankDetail = (payload) => api.post(`/api/banks`, payload);
export const updateBankDetail = (id,payload) => api.put(`/api/banks/${id}`, payload);
export const deleteBankDetail = id => api.delete(`/api/banks/${id}`);