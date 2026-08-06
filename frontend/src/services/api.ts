import type { ApiErrorBody } from '../types'

const API_URL = import.meta.env.VITE_API_URL || '/api/v1'
let csrfToken = ''
let refreshPromise: Promise<boolean> | null = null

export class ApiError extends Error {
  readonly status: number
  readonly body: ApiErrorBody

  constructor(status: number, body: ApiErrorBody) {
    super(Array.isArray(body.message) ? body.message.join(', ') : body.message)
    this.status = status
    this.body = body
  }
}

export function setCsrfToken(token: string): void {
  csrfToken = token
}

export async function fetchCsrf(): Promise<string> {
  const data = await apiRequest<{ csrfToken: string }>('/auth/csrf', {}, false)
  setCsrfToken(data.csrfToken)
  return data.csrfToken
}

async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then((response) => response.ok)
      .finally(() => (refreshPromise = null))
  }
  return refreshPromise
}

export async function apiRequest<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const method = (init.method || 'GET').toUpperCase()
  const headers = new Headers(init.headers)
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && csrfToken) headers.set('X-CSRF-Token', csrfToken)

  const response = await fetch(`${API_URL}${path}`, { ...init, headers, credentials: 'include' })
  const canRefresh = !['/auth/refresh', '/auth/login', '/auth/google', '/auth/register'].includes(path)
  if (response.status === 401 && retry && canRefresh) {
    if (await refreshSession()) {
      await fetchCsrf()
      return apiRequest<T>(path, init, false)
    }
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => ({
      statusCode: response.status,
      code: 'REQUEST_FAILED',
      message: 'No pudimos completar la solicitud',
    }))) as ApiErrorBody
    throw new ApiError(response.status, body)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export async function downloadCsv(path: string, filename: string): Promise<void> {
  const response = await fetch(`${API_URL}${path}`, { credentials: 'include' })
  if (!response.ok) throw new Error('No pudimos exportar la lista')
  const url = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
