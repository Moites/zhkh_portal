const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://192.168.1.106:5000'
const TOKEN_KEY = 'zhkh_token'

// Демо-режим (npm run dev:mock): вместо настоящего сервера отвечает src/api/mock.ts
export const IS_MOCK: boolean = import.meta.env.VITE_MOCK === 'true'

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export const UNAUTHORIZED_EVENT = 'zhkh:unauthorized'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function extractMessage(data: unknown, status: number): string {
  if (typeof data === 'string' && data.trim()) return data
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>
    if (typeof d.error === 'string') return d.error
    if (Array.isArray(d.errors)) return d.errors.join('. ')
    if (d.errors && typeof d.errors === 'object') {
      return Object.values(d.errors as Record<string, unknown>).flat().join('. ')
    }
    if (typeof d.title === 'string') return d.title
  }
  if (status === 401) return 'Нужно войти в систему'
  if (status === 403) return 'Недостаточно прав'
  if (status === 404) return 'Не найдено'
  return `Ошибка сервера (${status})`
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = tokenStorage.get()
  if (token) headers['Authorization'] = `Bearer ${token}`

  let status: number
  let data: unknown = undefined

  if (IS_MOCK) {
    const { mockHandler } = await import('./mock')
    const mocked = await mockHandler(method, path, body, token)
    status = mocked.status
    data = mocked.body
  } else {
    let response: Response
    try {
      response = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      })
    } catch {
      throw new ApiError(0, 'Нет связи с сервером. Проверьте, что API запущен')
    }

    // Ответ может быть JSON, обычной строкой или пустым
    const text = await response.text()
    status = response.status
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = text
      }
    }
  }

  if (status >= 400) {
    if (status === 401 && token) {
      tokenStorage.clear()
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    throw new ApiError(status, extractMessage(data, status))
  }

  return data as T
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
}
