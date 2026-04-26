import { BASE_URL, USER_ID } from './api'
import type { Avatar } from '../types'

export async function getAvatars(): Promise<Avatar[]> {
  const res = await fetch(`${BASE_URL}/api/avatars?user_id=${USER_ID}`)
  if (!res.ok) throw new Error('Failed to fetch avatars')
  return res.json()
}

export async function unlockAvatar(avatarId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/avatars/unlock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: USER_ID, avatar_id: avatarId }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to unlock avatar')
  }
}

export async function equipAvatar(avatarId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/avatars/equip/${avatarId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: USER_ID }),
  })
  if (!res.ok) throw new Error('Failed to equip avatar')
}
