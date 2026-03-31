import { apiClient } from '@/lib/api-client'

export function updateProposalStatus(proposalId, status) {
  return apiClient.patch(`/api/proposals/${proposalId}/status`, { status })
}

export function getMyDevProposals(params) {
  return apiClient.get('/api/proposals/me', { params })
}

export function withdrawProposal(proposalId) {
  return apiClient.patch(`/api/proposals/${proposalId}/withdraw`)
}

export function uploadProposalAttachment(proposalId, file) {
  const formData = new FormData()
  formData.append('file', file)

  return apiClient.post(`/api/proposals/${proposalId}/attachments`, formData, {
    isFormData: true,
  })
}

export function deleteProposalAttachment(attachmentId) {
  return apiClient.delete(`/api/proposals/attachments/${attachmentId}`)
}

export function getProposalAttachments(proposalId, params) {
  return apiClient.get(`/api/proposals/${proposalId}/attachments`, { params })
}
