import { apiFetch } from './api'
import type { Avatar } from '../types'

export async function getAvatars(): Promise<Avatar[]> {
  const res = await apiFetch('/api/avatars')
  if (!res.ok) throw new Error('Failed to fetch avatars')
  return res.json()
}

export async function unlockAvatar(avatarId: number): Promise<void> {
  const res = await apiFetch('/api/avatars/unlock', {
    method: 'POST',
    body: JSON.stringify({ avatar_id: avatarId }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to unlock avatar')
  }
}

export async function equipAvatar(avatarId: number): Promise<void> {
  const res = await apiFetch(`/api/avatars/equip/${avatarId}`, {
    method: 'PATCH',
    body: JSON.stringify({}),
  })
  if (!res.ok) throw new Error('Failed to equip avatar')
}
