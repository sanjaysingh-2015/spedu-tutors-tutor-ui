import axios from 'axios'
import api from './api'

const API_BASE = import.meta.env.VITE_ADMIN_API_BASE_URL || '';

// --- Bank ---
export const getBankDetails = () => api.get("/api/banks");
export const searchBankDetails = (param) => api.get(`/api/banks/search?${param}`);

export const createBankDetail = (payload) => api.post(`/api/banks`, payload);
export const updateBankDetail = (id,payload) => api.put(`/api/banks/${id}`, payload);
export const deleteBankDetail = id => api.delete(`/api/banks/${id}`);

export const getAvailability = () => api.get(`/api/availabilities`);
export const saveAvailability = (payload) => api.post(`api/availabilities`, payload);
export const updateAvailability = (id, payload) => api.put(`api/availabilities/${id}`, payload);
export const deleteAvailability = (id, payload) => api.delete(`api/availabilities/${id}`);
export const getTutorHolidays = () => api.get(`/api/holidays/active`);

export const getCountries = () => api.get('/api/master/countries');
export const getLevels = () => api.get('/api/master/levels');
export const getDocumentCategories = () => api.get('/api/master/document-categories');
export const getDocuments = () => api.get('/api/master/documents');
export const getDocumentByCategory = (catCode) => api.get(`/api/master/documents/${catCode}`)

export const getTutorDocuments = () => api.get(`/api/documents`);
export const searchTutorDocuments = (param) => api.get(`/api/documents/search?${param}`);
export const createTutorDocument = payload => api.post(`/api/documents`, payload);
export const updateTutorDocument = (id, payload) => api.put(`/api/documents/${id}`, payload);
export const deleteTutorDocument = id => api.delete(`/api/documents/${id}`);

export const getTutorAddresses = () => api.get(`/api/addresses`);
export const searchTutorAddresses = (param) => api.get(`/api/addresses/search?${param}`);
export const createTutorAddress = payload => api.post(`/api/addresses`, payload);
export const updateTutorAddress = (id, payload) => api.put(`/api/addresses/${id}`, payload);
export const deleteTutorAddress = id => api.delete(`/api/addresses/${id}`);

export const getTutorFeeStructures = () => api.get('/api/fees')
export const searchTutorFeeStructures = (param) => api.get(`/api/fees/search?${param}`)
export const createTutorFeeStructure = payload => api.post('/api/fees', payload)
export const updateTutorFeeStructure = (id, payload) => api.put(`/api/fees/${id}`, payload)
export const deleteTutorFeeStructure = id => api.delete(`/api/fees/${id}`)
