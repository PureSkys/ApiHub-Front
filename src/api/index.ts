import axios from 'axios'

export const API_BASE_URL = 'http://127.0.0.1:8000'
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
    const token = localStorage.getItem('apihub_access_token')
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
      localStorage.removeItem('apihub_access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)
export default apiClient