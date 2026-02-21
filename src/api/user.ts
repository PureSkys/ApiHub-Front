import apiClient from './index'
import qs from 'qs'
import { storage } from '@/utils/storage'
import { useAuthStore } from '@/stores/auth'

interface RegisterRequest {
  email: string
  hashed_password: string
  nickname: string
}

interface LoginRequest {
  username: string
  password: string
}

interface LoginResponse {
  access_token: string
  token_type: string
}
interface OAuth2LoginRequest extends LoginRequest {
  grant_type: string;
}

export const register = (data: RegisterRequest) => {
  return apiClient.post('/user/', data)
}

export const login = async (data: LoginRequest) => {
  const oauth2Data: OAuth2LoginRequest = {
    ...data,
    grant_type: 'password'
  };
  const response = await apiClient.post<LoginResponse>('/user/token', qs.stringify(oauth2Data), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  const token = response.data.access_token
  if (token) {
    storage.setToken(token)
    try {
      const authStore = useAuthStore()
      authStore.setAuthenticated(true)
    } catch (e) {
      // Store may not be initialized yet
    }
  }
  return response
}

export const getCurrentUser = () => {
  return apiClient.get('/user/me')
}
