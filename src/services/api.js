import axios from 'axios'
const API_BASE = import.meta.env.VITE_ADMIN_API_BASE_URL || ''

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('spedu_token')
  if(token){
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(r => r, err => {
  if((err.response && err.response.status === 401) || (err.response && err.response.status === 403)){
    localStorage.removeItem('spedu_token')
    window.location.href = '/login'
  }
  return Promise.reject(err)
})

export default api
