import { apiClient } from '@/lib/api-client'

export function register(payload) {
  return apiClient.post('/api/auth/register', payload, { useAuth: false })
}

export function login(payload) {
  return apiClient.post('/api/auth/login', payload, { useAuth: false })
}

export function getMe() {
  return apiClient.get('/api/auth/me')
}
