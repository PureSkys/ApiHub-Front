import axios from 'axios'
import { storage } from '@/utils/storage'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'
export const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || 'http://127.0.0.1:8000'
export const OPENAPI_DOCS_URL = `${API_BASE_URL}/docs`
export const OPENAPI_JSON_URL = `${API_BASE_URL}/openapi.json`

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export interface OpenAPISchema {
  openapi: string
  info: {
    title: string
    version: string
    description?: string
  }
  paths: Record<string, any>
  components: {
    schemas: Record<string, any>
  }
}

export const getOpenAPIDocument = () => {
  return apiClient.get<OpenAPISchema>('/openapi.json')
}

apiClient.interceptors.request.use(
  (config) => {
    const token = storage.getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      storage.removeToken()
      try {
        const authStore = useAuthStore()
        authStore.setAuthenticated(false)
      } catch (e) {
        // Store may not be initialized yet
      }
      const basePath = router.options.history.base
      window.location.href = `${basePath}/login`
    }
    return Promise.reject(error)
  },
)
export default apiClient
