import axios from 'axios'
import { useAuthStore } from '../store/authStore'

// In production / split deployment (e.g. Vercel frontend + Render backend):
// Set VITE_API_URL=https://your-backend.onrender.com in your frontend hosting environment.
// In local dev or fullstack single-service deployment, it defaults to relative '/api/v1'.
const rawBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || ''
const baseURL = rawBaseUrl
  ? `${rawBaseUrl.replace(/\/$/, '')}/api/v1`
  : '/api/v1'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})


api.interceptors.response.use(
  (res) => {
    // Safety check: if an API endpoint returned the HTML SPA fallback instead of JSON
    if (typeof res.data === 'string' && res.data.trim().startsWith('<!DOCTYPE html')) {
      return Promise.reject(new Error('Server returned HTML instead of JSON API response.'));
    }
    return res;
  },
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(err)
  }
)

export default api
