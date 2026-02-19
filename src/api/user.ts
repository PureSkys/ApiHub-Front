import apiClient from './index'
import qs from 'qs'
import { storage } from '@/utils/storage'

// 注册接口
interface RegisterRequest {
  email: string
  hashed_password: string
  nickname: string
}

// 登录接口
interface LoginRequest {
  username: string
  password: string
}

// 登录响应接口 包含 access_token 和 token_type
interface LoginResponse {
  access_token: string
  token_type: string
}
interface OAuth2LoginRequest extends LoginRequest {
  grant_type: string;
}
// 用户注册API
export const register = (data: RegisterRequest) => {
  return apiClient.post('/user/', data)
}

// 用户登录API并自动保存 token
export const login = async (data: LoginRequest) => {
  const oauth2Data: OAuth2LoginRequest = {
    ...data,
    grant_type: 'password' // OAuth2 密码模式必须传这个字段
  };
  const response = await apiClient.post<LoginResponse>('/user/token', qs.stringify(oauth2Data), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  const token = response.data.access_token
  if (token) {
    storage.setToken(token)
  }
  return response
}

// 获取当前用户信息API
export const getCurrentUser = () => {
  return apiClient.get('/user/me')
}
