import { apiFetch } from './api'
import type { User } from '../types'

export async function getUser(): Promise<User> {
  const res = await apiFetch('/auth/me')
  if (!res.ok) throw new Error('Not authenticated')
  return res.json()
}

export async function resetDatabase(): Promise<void> {
  const res = await apiFetch('/api/reset', { method: 'POST' })
  if (!res.ok) throw new Error('Failed to reset database')
}
