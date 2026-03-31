import { apiClient } from '@/lib/api-client'

export function createJob(payload) {
  return apiClient.post('/api/jobs/createJob', payload)
}

export function listJobs(params) {
  return apiClient.get('/api/jobs/listJobs', { params, useAuth: false })
}

export function getJobDetail(jobId) {
  return apiClient.get(`/api/jobs/${jobId}`, { useAuth: false })
}

export function applyJob(jobId, payload) {
  return apiClient.post(`/api/jobs/proposal/${jobId}`, payload)
}

export function getJobProposals(jobId) {
  return apiClient.get(`/api/jobs/proposal/${jobId}`)
}

export function closeJob(jobId) {
  return apiClient.patch(`/api/jobs/${jobId}/close`)
}
