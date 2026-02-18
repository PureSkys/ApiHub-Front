import axios from 'axios'
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})


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