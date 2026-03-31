import { apiClient } from '@/lib/api-client'

export function getMyNotifications(params) {
  return apiClient.get('/api/notifications/me', { params })
}

export function markNotificationAsRead(notificationId) {
  return apiClient.patch(`/api/notifications/${notificationId}/read`)
}
