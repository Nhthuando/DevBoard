import { apiClient } from '@/lib/api-client'

export function createPayment(contractId) {
  return apiClient.post(`/api/payments/contract/${contractId}`)
}

export function checkoutPayment(paymentId) {
  return apiClient.post(`/api/payments/${paymentId}/checkout`)
}

export function releasePayment(paymentId) {
  return apiClient.patch(`/api/payments/${paymentId}/release`)
}

export function getPaymentLogs(paymentId, params) {
  return apiClient.get(`/api/payments/${paymentId}/logs`, { params })
}
