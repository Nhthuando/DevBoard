import { apiClient } from '@/lib/api-client'

export function createReview(contractId, payload) {
  return apiClient.post(`/api/reviews/contracts/${contractId}`, payload)
}

export function getDevReviews(devId, params) {
  return apiClient.get(`/api/reviews/dev/${devId}`, { params, useAuth: false })
}

export function getContractReview(contractId) {
  return apiClient.get(`/api/reviews/contract/${contractId}`)
}

export function getMyReviews(params) {
  return apiClient.get('/api/reviews/me', { params })
}
