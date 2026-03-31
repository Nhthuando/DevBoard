import { getAccessToken } from '@/lib/auth-storage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    searchParams.set(key, String(value))
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

function normalizePath(path) {
  if (!path.startsWith('/')) {
    return `/${path}`
  }

  return path
}

function createApiError(response, payload) {
  const message = payload?.message || payload?.error?.formErrors?.[0] || `HTTP ${response.status}`
  const error = new Error(message)
  error.status = response.status
  error.payload = payload
  return error
}

async function request(path, options = {}) {
  const {
    method = 'GET',
    params,
    data,
    headers = {},
    signal,
    useAuth = true,
    isFormData = false,
  } = options

  const token = useAuth ? getAccessToken() : null
  const endpoint = `${API_BASE_URL}${normalizePath(path)}${buildQuery(params)}`

  const requestHeaders = {
    ...headers,
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`
  }

  if (!isFormData) {
    requestHeaders['Content-Type'] = requestHeaders['Content-Type'] || 'application/json'
  }

  const response = await fetch(endpoint, {
    method,
    headers: requestHeaders,
    body: data === undefined ? undefined : isFormData ? data : JSON.stringify(data),
    signal,
  })

  const contentType = response.headers.get('content-type') || ''
  let payload = null

  if (contentType.includes('application/json')) {
    payload = await response.json()
  } else {
    const text = await response.text()
    payload = text ? { message: text } : null
  }

  if (!response.ok) {
    throw createApiError(response, payload)
  }

  return payload
}

export const apiClient = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, data, options) => request(path, { ...options, method: 'POST', data }),
  patch: (path, data, options) => request(path, { ...options, method: 'PATCH', data }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
}
