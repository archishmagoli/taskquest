import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser, resetDatabase } from '../services/users'
import { getAvatars } from '../services/avatars'
import type { User, Avatar } from '../types'
import { Trophy, CheckSquare, Star, RotateCcw } from 'lucide-react'

interface ProfilePageProps {
  onReset: () => void
}

export default function ProfilePage({ onReset }: ProfilePageProps) {
  const [user, setUser] = useState<User | null>(null)
  const [avatars, setAvatars] = useState<Avatar[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [resetting, setResetting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getUser(1), getAvatars()])
      .then(([u, a]) => { setUser(u); setAvatars(a) })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  const handleReset = async () => {
    setResetting(true)
    try {
      await resetDatabase()
      onReset()
      navigate('/')
    } catch {
      setError('Failed to reset database')
      setResetting(false)
    }
  }

  const unlockedAvatars = avatars.filter(a => a.is_unlocked)

  if (loading) return <div className="flex-1 flex items-center justify-center text-purple-600 font-semibold">Loading profile...</div>
  if (error) return <div className="flex-1 flex items-center justify-center text-red-500">{error}</div>

  return (
    <div className="flex-1 p-8 bg-gradient-to-br from-blue-50 to-purple-50 overflow-auto">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        {/* Avatar + name */}
        <div className="bg-white border-2 border-purple-300 rounded-xl shadow-md p-8 flex flex-col items-center gap-4">
          {user?.avatar_image
            ? <img src={user.avatar_image} alt={user.avatar_name ?? 'avatar'} className="w-28 h-28 rounded-full border-4 border-purple-400 shadow-lg" />
            : <div className="w-28 h-28 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 border-4 border-purple-400 shadow-lg" />
          }
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">{user?.username}</h2>
            {user?.avatar_name && <p className="text-sm text-purple-600 font-semibold">Companion: {user.avatar_name}</p>}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border-2 border-yellow-300 rounded-xl shadow-md p-5 flex flex-col items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <span className="text-2xl font-bold text-gray-800">{user?.points ?? 0}</span>
            <span className="text-sm text-gray-500 font-semibold">Total Points</span>
          </div>
          <div className="bg-white border-2 border-green-300 rounded-xl shadow-md p-5 flex flex-col items-center gap-2">
            <CheckSquare className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-bold text-gray-800">{user?.tasks_completed ?? 0}</span>
            <span className="text-sm text-gray-500 font-semibold">Tasks Done</span>
          </div>
          <div className="bg-white border-2 border-purple-300 rounded-xl shadow-md p-5 flex flex-col items-center gap-2">
            <Star className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold text-gray-800">{unlockedAvatars.length}</span>
            <span className="text-sm text-gray-500 font-semibold">Avatars Unlocked</span>
          </div>
        </div>

        {/* Unlocked avatars */}
        {unlockedAvatars.length > 0 && (
          <div className="bg-white border-2 border-purple-300 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Unlocked Companions</h3>
            <div className="flex flex-wrap gap-4">
              {unlockedAvatars.map(avatar => (
                <div key={avatar.id} className="flex flex-col items-center gap-1">
                  <div className={`relative w-16 h-16 rounded-full border-2 overflow-hidden ${avatar.is_equipped ? 'border-green-500' : 'border-purple-300'}`}>
                    <img src={avatar.image_url} alt={avatar.name} className="w-full h-full object-cover" />
                    {avatar.is_equipped && (
                      <div className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-center text-[9px] font-bold py-0.5">Active</div>
                    )}
                  </div>
                  <span className="text-xs text-gray-600 font-semibold">{avatar.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reset */}
        <div className="bg-white border-2 border-red-200 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-1">Danger Zone</h3>
          <p className="text-sm text-gray-500 mb-4">This will wipe all your tasks, points, and avatar progress and restore the app to its default state.</p>
          {confirmReset ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-red-600">Are you sure? This cannot be undone.</span>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="px-4 py-2 bg-red-500 text-white rounded font-semibold hover:bg-red-600 disabled:opacity-50 text-sm"
              >
                {resetting ? 'Resetting...' : 'Yes, reset everything'}
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-4 py-2 bg-gray-200 rounded font-semibold hover:bg-gray-300 text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 border-2 border-red-300 rounded font-semibold hover:bg-red-200"
            >
              <RotateCcw className="w-4 h-4" />
              Reset My Profile
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
