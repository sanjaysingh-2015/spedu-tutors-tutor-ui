import axios from 'axios'
const API_BASE = import.meta.env.VITE_AUTH_API_BASE_URL || ''

const authApi = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})

authApi.interceptors.request.use(config => {
  const token = localStorage.getItem('spedu_token')
  if(token){
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

authApi.interceptors.response.use(r => r, err => {
  if(err.response && err.response.status === 401){
    localStorage.removeItem('spedu_token')
    localStorage.removeItem('loggedInUser')
    localStorage.removeItem('userRole')
    localStorage.removeItem('loginAt')
    window.location.href = '/login'
  }
  return Promise.reject(err)
})

export default authApi
