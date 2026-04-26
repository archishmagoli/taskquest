import { useEffect, useState } from 'react'
import { getAvatars, unlockAvatar, equipAvatar } from '../services/avatars'
import { getUser } from '../services/users'
import type { Avatar, User } from '../types'
import { Lock } from 'lucide-react'

interface AvatarsPageProps {
  onAvatarUpdate: () => void
}

export default function AvatarsPage({ onAvatarUpdate }: AvatarsPageProps) {
  const [avatars, setAvatars] = useState<Avatar[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const [avatarData, userData] = await Promise.all([getAvatars(), getUser()])
      setAvatars(avatarData)
      setUser(userData)
    } catch {
      setError('Failed to load avatars')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleUnlock = async (avatar: Avatar) => {
    setActionError(null)
    try {
      await unlockAvatar(avatar.id)
      await fetchData()
      onAvatarUpdate()
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to unlock avatar')
    }
  }

  const handleEquip = async (avatar: Avatar) => {
    setActionError(null)
    try {
      await equipAvatar(avatar.id)
      await fetchData()
      onAvatarUpdate()
    } catch {
      setActionError('Failed to equip avatar')
    }
  }

  if (loading) return <div className="flex-1 flex items-center justify-center text-purple-600 font-semibold">Loading avatars...</div>
  if (error) return <div className="flex-1 flex items-center justify-center text-red-500">{error}</div>

  return (
    <div className="flex-1 p-8 bg-gradient-to-br from-blue-50 to-purple-50 overflow-auto">
      <div className="flex justify-center mb-8">
        <div className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 border-2 border-orange-500 rounded-lg text-xl font-bold text-white shadow-lg">
          Available Points: {user?.points ?? 0}
        </div>
      </div>

      {actionError && (
        <div className="max-w-xl mx-auto mb-6 p-3 bg-red-100 border border-red-300 rounded text-red-600 text-center">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {avatars.map(avatar => (
          <div
            key={avatar.id}
            className={`border-2 p-4 rounded-lg shadow-md flex flex-col ${
  avatar.is_unlocked
    ? 'bg-white border-purple-300'
    : (user?.points ?? 0) >= avatar.point_cost
      ? 'bg-white border-purple-200'
      : 'bg-gray-100 border-gray-400 opacity-60'
}`}
          >
            <div className="relative w-full aspect-square mb-3 rounded-lg overflow-hidden bg-purple-50 border-2 border-purple-200 flex items-center justify-center">
              <img src={avatar.image_url} alt={avatar.name} className={`w-20 h-20 ${!avatar.is_unlocked ? 'grayscale' : ''}`} />
              {!avatar.is_unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                  <Lock className="w-10 h-10 text-white drop-shadow-lg" />
                </div>
              )}
              {avatar.is_equipped && (
                <div className="absolute top-1 right-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                  Active
                </div>
              )}
            </div>

            <h3 className="text-center font-bold text-gray-800 mb-1">{avatar.name}</h3>
            {avatar.description && <p className="text-xs text-gray-500 text-center mb-3 flex-1">{avatar.description}</p>}

            {avatar.is_unlocked ? (
              <button
                onClick={() => handleEquip(avatar)}
                disabled={avatar.is_equipped}
                className="w-full py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded border-2 border-green-600 disabled:opacity-50 disabled:cursor-default hover:brightness-105"
              >
                {avatar.is_equipped ? 'Equipped' : 'Equip'}
              </button>
            ) : (
              <button
                onClick={() => handleUnlock(avatar)}
                disabled={(user?.points ?? 0) < avatar.point_cost}
                className={`w-full py-2 font-bold rounded border-2 transition-colors ${
                  (user?.points ?? 0) >= avatar.point_cost
                    ? 'bg-purple-500 text-white border-purple-600 hover:bg-purple-600 cursor-pointer'
                    : 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
                }`}
              >
                {(user?.points ?? 0) >= avatar.point_cost ? `Unlock — ${avatar.point_cost} pts` : `${avatar.point_cost} pts`}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
