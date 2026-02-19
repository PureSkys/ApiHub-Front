import apiClient from './index'

export interface UptimeInfo {
  total_seconds: number
  days: number
  hours: number
  minutes: number
  seconds: number
  formatted: string
}

export interface HealthCheckResponse {
  status: 'healthy' | 'warning' | 'error'
  uptime: UptimeInfo
  timestamp: string
}

export const getHealthCheck = () => {
  return apiClient.get<HealthCheckResponse>('/health')
}
