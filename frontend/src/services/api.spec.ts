import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiRequest, setCsrfToken } from './api'

describe('apiRequest', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('always includes browser credentials', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: '1' }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await apiRequest('/events')

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/events', expect.objectContaining({ credentials: 'include' }))
  })

  it('adds CSRF to mutation requests', async () => {
    setCsrfToken('csrf-value')
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await apiRequest('/events', { method: 'POST', body: '{}' })
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit
    expect(new Headers(init.headers).get('X-CSRF-Token')).toBe('csrf-value')
  })

  it('restores /auth/me once when the access cookie expired', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ csrfToken: 'fresh-csrf' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'user-1' }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(apiRequest('/auth/me')).resolves.toEqual({ id: 'user-1' })

    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })
})
