const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function toAbsoluteUrl(path) {
  if (typeof path !== 'string' || !path.trim()) {
    throw new Error('API path is required')
  }

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}

async function parseResponse(response) {
  const rawBody = await response.text()
  let parsedBody = null

  if (rawBody) {
    try {
      parsedBody = JSON.parse(rawBody)
    } catch {
      parsedBody = rawBody
    }
  }

  if (!response.ok) {
    const apiMessage =
      parsedBody && typeof parsedBody === 'object'
        ? parsedBody.msg || parsedBody.message
        : null

    throw new Error(apiMessage || `Request failed with status ${response.status}`)
  }

  return parsedBody
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

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json'
  }

  const response = await fetch(toAbsoluteUrl(path), {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  })

  return parseResponse(response)
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
