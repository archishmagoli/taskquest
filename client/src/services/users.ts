import { BASE_URL } from './api'
import type { User } from '../types'

export async function getUser(id: number = 1): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/users/${id}`)
  if (!res.ok) throw new Error('Failed to fetch user')
  return res.json()
}

export async function resetDatabase(): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/reset`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to reset database')
}
