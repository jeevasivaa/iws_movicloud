import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

apiClient.interceptors.request.use((config) => {
  const nextConfig = { ...config }
  if (!nextConfig.headers) {
    nextConfig.headers = {}
  }

  const storage = window.localStorage.getItem('iws_auth_session')
  if (storage) {
    try {
      const parsed = JSON.parse(storage)
      const token = parsed?.token
      if (typeof token === 'string' && token.trim()) {
        nextConfig.headers.Authorization = `Bearer ${token.trim()}`
      }
    } catch {
      // Ignore malformed local storage value.
    }
  }

  return nextConfig
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      window.localStorage.removeItem('iws_auth_session')
    }
    return Promise.reject(error)
  },
)

export function getErrorMessage(error, fallback = 'Something went wrong') {
  const serverMsg = error?.response?.data?.msg || error?.response?.data?.message
  if (typeof serverMsg === 'string' && serverMsg.trim()) {
    return serverMsg
  }

  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message
  }

  return fallback
}

export async function apiRequest(path, options = {}) {
  const {
    method = 'GET',
    token,
    body,
    headers = {},
    signal,
  } = options

  const requestHeaders = { ...headers }
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`
  }

  const response = await apiClient.request({
    url: path,
    method,
    data: body,
    headers: requestHeaders,
    signal,
  })

  return response.data
}

export function apiGet(path, token, options = {}) {
  return apiRequest(path, { ...options, method: 'GET', token })
}

export function apiPost(path, body, token, options = {}) {
  return apiRequest(path, { ...options, method: 'POST', body, token })
}

export function apiPut(path, body, token, options = {}) {
  return apiRequest(path, { ...options, method: 'PUT', body, token })
}

export function apiDelete(path, token, options = {}) {
  return apiRequest(path, { ...options, method: 'DELETE', token })
}

export default apiClient
