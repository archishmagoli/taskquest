export const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) }
  if (options.body) headers['Content-Type'] = 'application/json'
  return fetch(`${BASE_URL}${path}`, { ...options, credentials: 'include', headers })
}
