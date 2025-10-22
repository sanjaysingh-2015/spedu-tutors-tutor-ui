import axios from 'axios'
import api from './api'

const API_BASE = import.meta.env.VITE_ADMIN_API_BASE_URL || '';

// --- Bank ---
export const getBankDetails = () => api.get("/api/banks");
export const searchBankDetails = (param) => api.get(`/api/banks/search?${param}`);

export const createBankDetail = (payload) => api.post(`/api/banks`, payload);
export const updateBankDetail = (id,payload) => api.put(`/api/banks/${id}`, payload);
export const deleteBankDetail = id => api.delete(`/api/banks/${id}`);

export const getAvailability = () => api.get(`/api/availabilities/days`);
export const saveAvailability = (payload) => api.post(`api/availabilities`, payload);
export const updateAvailability = (id, payload) => api.put(`api/availabilities/${id}`, payload);
export const deleteAvailability = (id) => api.delete(`api/availabilities/${id}`);
export const getTutorHolidays = () => api.get(`/api/holidays/active`);

export const getWeekends  = () => api.get(`/api/holidays/weekends`);
export const saveWeekend  = (payload) => api.post(`/api/holidays/weekends`, payload);

export const getCountries = () => api.get('/api/master/countries');
export const getLevels = () => api.get('/api/master/levels');
export const getDocumentCategories = () => api.get('/api/master/document-categories');
export const getDocuments = () => api.get('/api/master/documents');
export const getDocumentByCategory = (catCode) => api.get(`/api/master/documents/${catCode}`)
export const getSubjects = () => api.get('/api/master/subjects');

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

export const getPersonalInfo = () => api.get('/api/personal')
export const getFileResource = () => api.get('/api/personal/file', { responseType: 'blob' })
export const getDocumentResource = (id) => api.get(`/api/documents/file/${id}`, { responseType: 'blob' })
export const updatePersonalInfo = (payload) => api.put(`/api/personal`, payload)

export const getClasses = () => api.get(`/api/classes`)
export const searchClasses = (param) => api.get(`/api/classes/search?${param}`)
export const createClass = (payload) => api.post(`/api/classes`, payload)
export const updateClass = (id, payload) => api.put(`/api/classes/${id}`, payload)
export const deleteClass = (id) => api.delete(`/api/classes`)

// --- Resume ---
export const uploadResumeFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem('spedu_token')
    const response = await axios.post(`${API_BASE}/api/personal/resume`, formData, {
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

// --- Resume ---
export const uploadDocumentFile = async (docType, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem('spedu_token')
    const response = await axios.post(`${API_BASE}/api/documents/file/${docType}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`
      },
    });

    return response.data; // could be file path / success message
  } catch (error) {
    console.error("Error uploading resume:", error);
    throw error;
  }
};
