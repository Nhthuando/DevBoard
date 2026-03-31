import { apiClient } from '@/lib/api-client'

export function createContractFromProposal(proposalId) {
  return apiClient.post(`/api/contracts/from-proposal/${proposalId}`)
}

export function getMyContracts(params) {
  return apiClient.get('/api/contracts/me', { params })
}

export function getContractDetail(contractId) {
  return apiClient.get(`/api/contracts/${contractId}`)
}

export function submitDelivery(contractId, payload) {
  return apiClient.post(`/api/contracts/${contractId}/deliveries`, payload)
}

export function reviewDelivery(contractId, payload) {
  return apiClient.post(`/api/contracts/${contractId}/reviews`, payload)
}
